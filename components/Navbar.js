'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchOpen(false);
            setMobileMenuOpen(false);
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link href="/" className="navbar-logo">
                        <div className="navbar-logo-icon">🔥</div>
                        <span className="text-gradient">DealsHub</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="navbar-links">
                        <Link href="/" className="navbar-link">Home</Link>
                        <Link href="/products" className="navbar-link">All Deals</Link>
                        <Link href="/products?platform=amazon" className="navbar-link">Amazon</Link>
                        <Link href="/products?platform=flipkart" className="navbar-link">Flipkart</Link>
                    </div>

                    {/* Desktop Search & Mobile Buttons */}
                    <div className="navbar-actions">
                        {/* Desktop Search */}
                        <form onSubmit={handleSearch} className="navbar-search-desktop">
                            <input
                                type="text"
                                placeholder="Search deals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="navbar-search-input"
                            />
                            <button type="submit" className="navbar-search-btn">
                                🔍
                            </button>
                        </form>

                        {/* Mobile Search Toggle */}
                        <button
                            className="navbar-icon-btn mobile-only"
                            onClick={() => setSearchOpen(!searchOpen)}
                            aria-label="Search"
                        >
                            🔍
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="navbar-hamburger mobile-only"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {searchOpen && (
                    <div className="navbar-mobile-search">
                        <form onSubmit={handleSearch} className="navbar-mobile-search-form">
                            <input
                                type="text"
                                placeholder="Search for deals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="navbar-search-input"
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                                Search
                            </button>
                        </form>
                    </div>
                )}
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`navbar-mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Mobile Menu Drawer */}
            <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="navbar-mobile-header">
                    <Link href="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
                        <div className="navbar-logo-icon">🔥</div>
                        <span className="text-gradient">DealsHub</span>
                    </Link>
                    <button
                        className="navbar-close-btn"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                <nav className="navbar-mobile-nav">
                    <Link href="/" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                        <span className="navbar-mobile-link-icon">🏠</span>
                        <span>Home</span>
                    </Link>
                    <Link href="/products" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                        <span className="navbar-mobile-link-icon">🛍️</span>
                        <span>All Deals</span>
                    </Link>
                    <Link href="/products?platform=amazon" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                        <span className="navbar-mobile-link-icon">📦</span>
                        <span>Amazon Deals</span>
                    </Link>
                    <Link href="/products?platform=flipkart" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                        <span className="navbar-mobile-link-icon">🛒</span>
                        <span>Flipkart Deals</span>
                    </Link>
                    <Link href="/products?platform=myntra" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                        <span className="navbar-mobile-link-icon">👗</span>
                        <span>Myntra Deals</span>
                    </Link>
                </nav>

                <div className="navbar-mobile-footer">
                    <Link href="/admin" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                        Admin Panel
                    </Link>
                </div>
            </div>
        </>
    );
}
