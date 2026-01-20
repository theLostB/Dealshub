import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-brand-logo">
                            <div className="navbar-logo-icon">🔥</div>
                            <span className="text-gradient">DealsHub</span>
                        </div>
                        <p className="footer-brand-text">
                            Your one-stop destination for the best deals and offers from top e-commerce platforms.
                            Save money on your favorite products with our curated affiliate offers.
                        </p>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-column-title">Shop By Platform</h4>
                        <div className="footer-links">
                            <Link href="/products?platform=amazon" className="footer-link">Amazon Deals</Link>
                            <Link href="/products?platform=flipkart" className="footer-link">Flipkart Deals</Link>
                            <Link href="/products?platform=myntra" className="footer-link">Myntra Deals</Link>
                            <Link href="/products" className="footer-link">All Deals</Link>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-column-title">Categories</h4>
                        <div className="footer-links">
                            <Link href="/products?category=electronics" className="footer-link">Electronics</Link>
                            <Link href="/products?category=fashion" className="footer-link">Fashion</Link>
                            <Link href="/products?category=home" className="footer-link">Home & Kitchen</Link>
                            <Link href="/products?category=beauty" className="footer-link">Beauty</Link>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-column-title">Quick Links</h4>
                        <div className="footer-links">
                            <Link href="/" className="footer-link">Home</Link>
                            <Link href="/products" className="footer-link">Browse Deals</Link>
                            <Link href="/admin" className="footer-link">Admin</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © 2026 DealsHub. All rights reserved. Affiliate Disclosure: We earn commissions from purchases.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="footer-social-link" aria-label="Twitter">𝕏</a>
                        <a href="#" className="footer-social-link" aria-label="Instagram">📷</a>
                        <a href="#" className="footer-social-link" aria-label="Facebook">📘</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
