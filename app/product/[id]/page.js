'use client';
import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { trackProductClick } from '@/components/AnalyticsTracker';

export default function ProductDetailPage({ params }) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        fetchProduct();
    }, [resolvedParams.id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch('/api/products');
            const products = await res.json();

            const foundProduct = products.find(p => p.id === resolvedParams.id);
            setProduct(foundProduct);

            // Get related products (same category or platform)
            if (foundProduct) {
                const related = products
                    .filter(p =>
                        p.id !== foundProduct.id &&
                        (p.category === foundProduct.category || p.platform === foundProduct.platform)
                    )
                    .slice(0, 4);
                setRelatedProducts(related);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            setLoading(false);
        }
    };

    const handleBuyClick = () => {
        if (product) {
            trackProductClick(product);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price || 0);
    };

    const discount = product?.originalPrice && product?.originalPrice > product?.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = product ? `Check out this amazing deal: ${product.title}` : '';

    const shareLinks = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        copy: shareUrl,
    };

    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="product-detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading product...</p>
                </main>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <main className="product-detail-loading">
                    <span style={{ fontSize: '4rem' }}>😕</span>
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for doesn't exist.</p>
                    <Link href="/products" className="btn btn-primary">
                        Browse All Deals
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="product-detail">
                <div className="container">
                    {/* Breadcrumb */}
                    <nav className="product-breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/products">Deals</Link>
                        <span>/</span>
                        <span>{product.platform}</span>
                    </nav>

                    <div className="product-detail-grid">
                        {/* Product Image */}
                        <div className="product-detail-image-section">
                            <div className="product-detail-image-wrapper">
                                <img
                                    src={product.image || 'https://via.placeholder.com/600x400/1a1a25/6366f1?text=No+Image'}
                                    alt={product.title}
                                    className="product-detail-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400/1a1a25/6366f1?text=No+Image';
                                    }}
                                />
                                {discount > 0 && (
                                    <span className="product-detail-discount">-{discount}% OFF</span>
                                )}
                                <span className={`product-detail-platform ${product.platform?.toLowerCase()}`}>
                                    {product.platform}
                                </span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="product-detail-info">
                            <span className="product-detail-category">{product.category}</span>
                            <h1 className="product-detail-title">{product.title}</h1>

                            <div className="product-detail-pricing">
                                <span className="product-detail-price">{formatPrice(product.price)}</span>
                                {product.originalPrice > product.price && (
                                    <>
                                        <span className="product-detail-original">{formatPrice(product.originalPrice)}</span>
                                        <span className="product-detail-savings">
                                            You save {formatPrice(product.originalPrice - product.price)}
                                        </span>
                                    </>
                                )}
                            </div>

                            <p className="product-detail-description">{product.description}</p>

                            {/* Buy Button */}
                            <a
                                href={product.affiliateLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary product-detail-buy-btn"
                                onClick={handleBuyClick}
                            >
                                <span>Buy Now on {product.platform}</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                            </a>

                            {/* Share Section */}
                            <div className="product-detail-share">
                                <span className="product-detail-share-label">Share this deal:</span>
                                <div className="product-detail-share-buttons">
                                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-btn whatsapp" title="Share on WhatsApp">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </a>
                                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="share-btn twitter" title="Share on Twitter">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="share-btn facebook" title="Share on Facebook">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>
                                    <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className="share-btn telegram" title="Share on Telegram">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                        </svg>
                                    </a>
                                    <button onClick={copyLink} className="share-btn copy" title="Copy Link">
                                        {copied ? '✓' : '🔗'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <section className="product-detail-related">
                            <h2 className="section-title">Related Deals</h2>
                            <div className="products-grid">
                                {relatedProducts.map((p) => (
                                    <Link key={p.id} href={`/product/${p.id}`} className="product-card">
                                        <div className="product-card-image-wrapper">
                                            <img
                                                src={p.image || 'https://via.placeholder.com/400x300/1a1a25/6366f1?text=No+Image'}
                                                alt={p.title}
                                                className="product-card-image"
                                            />
                                        </div>
                                        <span className={`product-card-badge ${p.platform?.toLowerCase()}`}>
                                            {p.platform}
                                        </span>
                                        <div className="product-card-content">
                                            <span className="product-card-category">{p.category}</span>
                                            <h3 className="product-card-title">{p.title}</h3>
                                            <div className="product-card-footer">
                                                <span className="product-card-price">{formatPrice(p.price)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
