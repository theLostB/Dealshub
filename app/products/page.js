'use client';
import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const platform = searchParams.get('platform');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        if (platform) {
            setActiveFilter(platform.toLowerCase());
        } else if (category) {
            setActiveFilter(category.toLowerCase());
        } else {
            setActiveFilter('all');
        }

        if (search) {
            setSearchQuery(search);
        }

        setCurrentPage(1);
    }, [searchParams]);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, activeFilter, sortBy, searchQuery]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let result = [...products];

        // Filter by platform/category
        if (activeFilter !== 'all') {
            result = result.filter(
                (p) =>
                    p.platform?.toLowerCase() === activeFilter ||
                    p.category?.toLowerCase() === activeFilter
            );
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title?.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query) ||
                    p.category?.toLowerCase().includes(query)
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high':
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'discount':
                result.sort((a, b) => {
                    const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
                    const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
                    return discountB - discountA;
                });
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
        }

        setFilteredProducts(result);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
        // Update URL
        if (filter === 'all') {
            router.push('/products');
        } else {
            router.push(`/products?platform=${filter}`);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    const platforms = ['all', 'amazon', 'flipkart', 'myntra'];
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'discount', label: 'Highest Discount' },
    ];

    return (
        <>
            <Navbar />

            <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">
                            {searchQuery ? (
                                <>Search Results for "<span className="text-gradient">{searchQuery}</span>"</>
                            ) : (
                                <>All <span className="text-gradient">Deals</span></>
                            )}
                        </h1>
                        <p className="section-subtitle">
                            {filteredProducts.length} deals found
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="products-search-bar">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="products-search-input"
                        />
                        <span className="products-search-icon">🔍</span>
                    </div>

                    {/* Filters & Sorting */}
                    <div className="products-controls">
                        <div className="category-filters">
                            {platforms.map((platform) => (
                                <button
                                    key={platform}
                                    className={`category-filter ${activeFilter === platform ? 'active' : ''}`}
                                    onClick={() => handleFilterChange(platform)}
                                >
                                    {platform === 'all' ? 'All' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="products-sort">
                            <label htmlFor="sort" style={{ color: 'var(--text-tertiary)', marginRight: '0.5rem', fontSize: '0.9rem' }}>
                                Sort by:
                            </label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="products-sort-select"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="products-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading deals...</p>
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        <div className="products-empty">
                            <span className="products-empty-icon">🔍</span>
                            <h3>No deals found</h3>
                            <p>Try adjusting your search or filter criteria.</p>
                            <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {paginatedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ← Prev
                                    </button>

                                    <div className="pagination-pages">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                            .map((page, idx, arr) => (
                                                <>
                                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                        <span key={`ellipsis-${page}`} className="pagination-ellipsis">...</span>
                                                    )}
                                                    <button
                                                        key={page}
                                                        className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </>
                                            ))}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
