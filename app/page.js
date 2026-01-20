import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

async function getProducts() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'products.json');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export default async function Home() {
    const products = await getProducts();
    const featuredProducts = products.slice(0, 6);

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="hero-badge-dot"></span>
                            <span>New deals added daily</span>
                        </div>

                        <h1 className="hero-title">
                            Discover the <span className="text-gradient">Best Deals</span> from Top Brands
                        </h1>

                        <p className="hero-subtitle">
                            Curated offers from Amazon, Flipkart, Myntra and more.
                            Save money on electronics, fashion, home & lifestyle products.
                        </p>

                        <div className="hero-cta">
                            <Link href="/products" className="btn btn-primary">
                                Browse All Deals
                            </Link>
                            <Link href="/products?platform=amazon" className="btn btn-secondary">
                                Amazon Deals
                            </Link>
                        </div>

                        <div className="hero-stats">
                            <div className="hero-stat">
                                <div className="hero-stat-number">{products.length || '500'}+</div>
                                <div className="hero-stat-label">Active Deals</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-number">50%</div>
                                <div className="hero-stat-label">Avg. Savings</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-number">5+</div>
                                <div className="hero-stat-label">Platforms</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            🔥 <span className="text-gradient">Hot Deals</span> Right Now
                        </h2>
                        <p className="section-subtitle">
                            Hand-picked offers with the best discounts. Don't miss out!
                        </p>
                    </div>

                    <div className="products-grid">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link href="/products" className="btn btn-primary">
                            View All Deals →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Platform Showcase */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Shop by Platform</h2>
                        <p className="section-subtitle">
                            We aggregate the best deals from all your favorite e-commerce sites.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <Link href="/products?platform=amazon" className="product-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--amazon-color)' }}>Amazon</h3>
                            <p style={{ color: 'var(--text-tertiary)' }}>Biggest selection & fast delivery</p>
                        </Link>

                        <Link href="/products?platform=flipkart" className="product-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--flipkart-color)' }}>Flipkart</h3>
                            <p style={{ color: 'var(--text-tertiary)' }}>Great deals on electronics & fashion</p>
                        </Link>

                        <Link href="/products?platform=myntra" className="product-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👗</div>
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--myntra-color)' }}>Myntra</h3>
                            <p style={{ color: 'var(--text-tertiary)' }}>Fashion & lifestyle experts</p>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
