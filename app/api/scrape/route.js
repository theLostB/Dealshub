import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Function to detect platform from URL
function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon')) return 'Amazon';
    if (urlLower.includes('flipkart')) return 'Flipkart';
    if (urlLower.includes('myntra')) return 'Myntra';
    if (urlLower.includes('ajio')) return 'Ajio';
    if (urlLower.includes('snapdeal')) return 'Snapdeal';
    return 'Other';
}

// Function to extract product data from HTML
function extractProductData(html, url, platform) {
    const $ = cheerio.load(html);

    let title = '';
    let image = '';
    let price = '';
    let description = '';

    // Platform-specific selectors
    if (platform === 'Amazon') {
        title = $('#productTitle').text().trim() ||
            $('h1 span#title').text().trim() ||
            $('h1').first().text().trim();

        image = $('#landingImage').attr('src') ||
            $('#imgBlkFront').attr('src') ||
            $('.a-dynamic-image').first().attr('src') ||
            $('img[data-a-dynamic-image]').first().attr('src');

        price = $('.a-price .a-offscreen').first().text().trim() ||
            $('#priceblock_ourprice').text().trim() ||
            $('#priceblock_dealprice').text().trim() ||
            $('.a-color-price').first().text().trim();

        description = $('#feature-bullets ul').text().trim() ||
            $('#productDescription').text().trim();

    } else if (platform === 'Flipkart') {
        title = $('span.B_NuCI').text().trim() ||
            $('h1.yhB1nd span').text().trim() ||
            $('h1').first().text().trim();

        image = $('img._396cs4').attr('src') ||
            $('img._2r_T1I').attr('src') ||
            $('img[loading="eager"]').first().attr('src');

        price = $('div._30jeq3._16Jk6d').text().trim() ||
            $('div._30jeq3').first().text().trim();

        description = $('div._1mXcCf').text().trim() ||
            $('div._1AN87F').text().trim();

    } else if (platform === 'Myntra') {
        title = $('h1.pdp-title').text().trim() ||
            $('h1').first().text().trim();

        image = $('img.image-grid-image').first().attr('src') ||
            $('img[loading="eager"]').first().attr('src');

        price = $('span.pdp-price strong').text().trim() ||
            $('.pdp-discount-container span').first().text().trim();

        description = $('p.pdp-product-description-content').text().trim();
    }

    // Fallback generic selectors
    if (!title) {
        title = $('h1').first().text().trim() ||
            $('title').text().trim() ||
            'Product Title';
    }

    if (!image) {
        image = $('meta[property="og:image"]').attr('content') ||
            $('img').first().attr('src') ||
            '';
    }

    if (!price) {
        // Try to find any price-like pattern
        const pricePattern = /₹[\d,]+/;
        const bodyText = $('body').text();
        const match = bodyText.match(pricePattern);
        price = match ? match[0] : '₹0';
    }

    // Clean up price - extract numeric value
    const priceNum = parseInt(price.replace(/[^\d]/g, '')) || 0;

    // Clean up description
    description = description.substring(0, 300) + (description.length > 300 ? '...' : '');

    return {
        title: title.substring(0, 150),
        image: image,
        price: priceNum,
        originalPrice: Math.round(priceNum * 1.2), // Assume 20% discount for demo
        description: description || 'No description available',
        platform: platform,
        affiliateLink: url,
        category: 'General',
    };
}

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const platform = detectPlatform(url);

        // Fetch the page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        if (!response.ok) {
            // Return fallback data with URL info
            return NextResponse.json({
                title: 'Product from ' + platform,
                image: '',
                price: 0,
                originalPrice: 0,
                description: 'Unable to fetch product details. Please enter manually.',
                platform: platform,
                affiliateLink: url,
                category: 'General',
                fetchFailed: true,
            });
        }

        const html = await response.text();
        const productData = extractProductData(html, url, platform);

        return NextResponse.json(productData);

    } catch (error) {
        console.error('Scraping error:', error);

        // Return partial data on error
        return NextResponse.json({
            title: 'Product',
            image: '',
            price: 0,
            originalPrice: 0,
            description: 'Unable to fetch product details. Please enter manually.',
            platform: detectPlatform(request.url || ''),
            affiliateLink: '',
            category: 'General',
            fetchFailed: true,
        });
    }
}
