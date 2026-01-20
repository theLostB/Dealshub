'use client';
import { useEffect } from 'react';

// Generate a unique session ID
const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Get or create session ID
const getSessionId = () => {
    if (typeof window === 'undefined') return null;

    let sessionId = sessionStorage.getItem('dealshub_session');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('dealshub_session', sessionId);
    }
    return sessionId;
};

// Get device type
const getDeviceType = () => {
    if (typeof window === 'undefined') return 'Desktop';

    const userAgent = navigator.userAgent.toLowerCase();
    if (/ipad|tablet|playbook|silk/i.test(userAgent)) return 'Tablet';
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) return 'Mobile';
    return 'Desktop';
};

// Get browser name
const getBrowserName = () => {
    if (typeof window === 'undefined') return 'Unknown';

    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Other';
};

// Get OS name
const getOSName = () => {
    if (typeof window === 'undefined') return 'Unknown';

    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Other';
};

// Get referrer source
const getReferrerSource = () => {
    if (typeof window === 'undefined') return 'Direct';

    const referrer = document.referrer;
    if (!referrer) return 'Direct';

    try {
        const url = new URL(referrer);
        const host = url.hostname.toLowerCase();

        if (host.includes('google')) return 'Google';
        if (host.includes('facebook') || host.includes('fb.')) return 'Facebook';
        if (host.includes('twitter') || host.includes('t.co')) return 'Twitter';
        if (host.includes('instagram')) return 'Instagram';
        if (host.includes('youtube')) return 'YouTube';
        if (host.includes('linkedin')) return 'LinkedIn';
        if (host.includes('reddit')) return 'Reddit';
        if (host.includes('whatsapp')) return 'WhatsApp';
        if (host.includes('telegram')) return 'Telegram';
        if (host.includes(window.location.hostname)) return 'Internal';

        return host.replace('www.', '').split('.')[0];
    } catch {
        return 'Direct';
    }
};

// Get readable language
const getLanguage = () => {
    if (typeof window === 'undefined') return 'Unknown';

    const lang = navigator.language || navigator.languages?.[0] || 'Unknown';
    const langMap = {
        'en-US': 'English (US)',
        'en-GB': 'English (UK)',
        'en-IN': 'English (India)',
        'en': 'English',
        'hi': 'Hindi',
        'hi-IN': 'Hindi',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'pt': 'Portuguese',
        'ru': 'Russian',
    };
    return langMap[lang] || lang;
};

// Get timezone
const getTimezone = () => {
    if (typeof window === 'undefined') return 'Unknown';

    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz || 'Unknown';
    } catch {
        return 'Unknown';
    }
};

export default function AnalyticsTracker() {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.location.pathname.startsWith('/admin')) return;

        const sessionId = getSessionId();
        const hasTracked = sessionStorage.getItem('dealshub_tracked');

        if (!hasTracked) {
            trackVisitor(sessionId);
        }
    }, []);

    return null;
}

// Track visitor
async function trackVisitor(sessionId) {
    try {
        const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'visitor',
                sessionId,
                referrer: getReferrerSource(),
                device: getDeviceType(),
                browser: getBrowserName(),
                os: getOSName(),
                page: window.location.pathname,
                language: getLanguage(),
                timezone: getTimezone(),
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
            }),
        });

        if (response.ok) {
            sessionStorage.setItem('dealshub_tracked', 'true');
        }
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
}

// Function to track product clicks
export async function trackProductClick(product) {
    try {
        const sessionId = getSessionId();

        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'click',
                sessionId,
                productId: product.id,
                productTitle: product.title,
                platform: product.platform,
                price: product.price,
            }),
        });
    } catch (error) {
        console.error('Click tracking error:', error);
    }
}
