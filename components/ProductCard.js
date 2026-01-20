'use client';
import Link from 'next/link';
import { trackProductClick } from './AnalyticsTracker';

export default function ProductCard({ product }) {
    const platformClass = product.platform?.toLowerCase() || 'amazon';

    const formatPrice = (price) => {
        if (!price) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleBuyClick = (e) => {
        e.stopPropagation();
        trackProductClick(product);
    };

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="product-card">
            <Link href={`/product/${product.id}`} className="product-card-link">
                <div className="product-card-image-wrapper">
                    <img
                        src={product.image || '/placeholder.jpg'}
                        alt={product.title}
                        className="product-card-image"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300/1a1a25/6366f1?text=No+Image';
                        }}
                    />
                    {discount > 0 && (
                        <span className="product-card-discount">-{discount}%</span>
                    )}
                </div>

                <span className={`product-card-badge ${platformClass}`}>
                    {product.platform || 'Amazon'}
                </span>

                <div className="product-card-content">
                    <span className="product-card-category">{product.category || 'General'}</span>
                    <h3 className="product-card-title">{product.title}</h3>
                    <p className="product-card-description">{product.description}</p>

                    <div className="product-card-footer">
                        <div className="product-card-pricing">
                            <span className="product-card-price">{formatPrice(product.price)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="product-card-original-price">{formatPrice(product.originalPrice)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            <a
                href={product.affiliateLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="product-card-btn"
                onClick={handleBuyClick}
            >
                <span>View Deal</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
            </a>
        </div>
    );
}
