import './globals.css'
import AnalyticsTracker from '@/components/AnalyticsTracker'

export const metadata = {
    title: 'DealsHub - Best Deals & Offers from Top Brands',
    description: 'Discover amazing deals and discounts from Amazon, Flipkart, and more. Save money on your favorite products with our curated affiliate offers.',
    keywords: 'deals, offers, discounts, amazon, flipkart, shopping, affiliate',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AnalyticsTracker />
                {children}
            </body>
        </html>
    )
}
