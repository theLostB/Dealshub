import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'analytics.json');

// Load analytics data
function loadAnalytics() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
    return { visitors: [], clicks: [], dailyStats: {} };
}

// Save analytics data
function saveAnalytics(data) {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving analytics:', error);
    }
}

// Get IP-based location using free API
async function getLocationFromIP(ip) {
    try {
        // Skip for localhost/private IPs
        if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.') || ip === 'Unknown') {
            return null; // Return null for localhost, will use default
        }

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,isp`);
        const data = await response.json();

        if (data.status === 'success') {
            return {
                city: data.city || 'Unknown',
                country: data.country || 'Unknown',
                countryCode: data.countryCode || '',
                region: data.regionName || '',
                isp: data.isp || ''
            };
        }
    } catch (error) {
        console.error('Location API error:', error);
    }

    return null;
}

// GET - Fetch analytics data
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days')) || 30;
        const includeVisitors = searchParams.get('visitors') === 'true';

        const analytics = loadAnalytics();
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Filter data by date range
        const filteredVisitors = analytics.visitors.filter(v => new Date(v.timestamp) >= startDate);
        const filteredClicks = analytics.clicks.filter(c => new Date(c.timestamp) >= startDate);

        // Calculate summary stats
        const uniqueSessions = new Set(filteredVisitors.map(v => v.sessionId)).size;
        const conversionRate = filteredVisitors.length > 0
            ? ((filteredClicks.length / filteredVisitors.length) * 100).toFixed(1)
            : 0;

        // For chart data - group by date
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayVisitors = filteredVisitors.filter(v => v.timestamp?.startsWith(dateStr)).length;
            const dayClicks = filteredClicks.filter(c => c.timestamp?.startsWith(dateStr)).length;

            chartData.push({
                date: displayDate,
                visitors: dayVisitors,
                clicks: dayClicks,
            });
        }

        // Top products by clicks
        const productClicks = {};
        filteredClicks.forEach(click => {
            const key = click.productId;
            if (!productClicks[key]) {
                productClicks[key] = {
                    productId: click.productId,
                    productTitle: click.productTitle,
                    platform: click.platform,
                    count: 0
                };
            }
            productClicks[key].count++;
        });
        const topProducts = Object.values(productClicks)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Traffic sources
        const sourceCount = {};
        filteredVisitors.forEach(v => {
            const source = v.referrer || 'Direct';
            sourceCount[source] = (sourceCount[source] || 0) + 1;
        });
        const sources = Object.entries(sourceCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // Device distribution
        const devices = {};
        filteredVisitors.forEach(v => {
            const device = v.device || 'Desktop';
            devices[device] = (devices[device] || 0) + 1;
        });

        // Browser distribution
        const browsers = {};
        filteredVisitors.forEach(v => {
            const browser = v.browser || 'Other';
            browsers[browser] = (browsers[browser] || 0) + 1;
        });

        // Location distribution
        const locations = {};
        filteredVisitors.forEach(v => {
            if (v.location?.country && v.location.country !== 'Unknown') {
                const loc = v.location.country;
                locations[loc] = (locations[loc] || 0) + 1;
            }
        });
        const topLocations = Object.entries(locations)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Recent clicks
        const recentClicks = filteredClicks.slice(-30).reverse();

        // Build response
        const response = {
            summary: {
                totalVisitors: filteredVisitors.length,
                uniqueVisitors: uniqueSessions,
                totalClicks: filteredClicks.length,
                conversionRate: parseFloat(conversionRate),
            },
            chartData,
            topProducts,
            sources,
            devices,
            browsers,
            locations: topLocations,
            recentClicks,
        };

        // Include detailed visitor list if requested
        if (includeVisitors) {
            const visitorMap = new Map();

            filteredVisitors.forEach(v => {
                if (!visitorMap.has(v.sessionId)) {
                    visitorMap.set(v.sessionId, {
                        sessionId: v.sessionId,
                        ip: v.ip || 'Localhost',
                        location: v.location || { city: 'Local', country: 'Development' },
                        device: v.device || 'Desktop',
                        browser: v.browser || 'Chrome',
                        os: v.os || 'Unknown',
                        referrer: v.referrer || 'Direct',
                        language: v.language || 'English',
                        timezone: v.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                        firstVisit: v.timestamp,
                        lastVisit: v.timestamp,
                        pageViews: 1,
                        pages: [v.page],
                        clicks: [],
                    });
                } else {
                    const visitor = visitorMap.get(v.sessionId);
                    visitor.pageViews++;
                    visitor.lastVisit = v.timestamp;
                    if (!visitor.pages.includes(v.page)) {
                        visitor.pages.push(v.page);
                    }
                }
            });

            // Add clicks to visitors
            filteredClicks.forEach(c => {
                const visitor = visitorMap.get(c.sessionId);
                if (visitor) {
                    visitor.clicks.push({
                        productTitle: c.productTitle,
                        platform: c.platform,
                        price: c.price,
                        timestamp: c.timestamp,
                    });
                }
            });

            response.visitors = Array.from(visitorMap.values())
                .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
                .slice(0, 100);
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Analytics GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

// POST - Track visitor or click
export async function POST(request) {
    try {
        const body = await request.json();
        const { type, ...data } = body;

        const analytics = loadAnalytics();

        // Get client IP from headers
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const clientIp = forwarded?.split(',')[0] || realIp || null;

        if (type === 'visitor') {
            // Get location from IP (only if real IP available)
            let location = null;
            if (clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1') {
                location = await getLocationFromIP(clientIp);
            }

            // Use local fallback if no location
            if (!location) {
                location = { city: 'Local', country: 'Development' };
            }

            analytics.visitors.push({
                ...data,
                ip: clientIp || 'Localhost',
                location,
                timestamp: new Date().toISOString(),
            });
        } else if (type === 'click') {
            analytics.clicks.push({
                ...data,
                ip: clientIp || 'Localhost',
                timestamp: new Date().toISOString(),
            });
        }

        saveAnalytics(analytics);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics POST error:', error);
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }
}
