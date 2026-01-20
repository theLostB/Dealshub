'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, BarChart, DonutChart } from '@/components/Charts';
import {
    IconDashboard, IconUsers, IconPackage, IconPlus, IconSettings, IconLogout,
    IconGlobe, IconRefresh, IconDownload, IconEdit, IconTrash, IconExternalLink,
    IconClick, IconTarget, IconTrendingUp, IconBarChart, IconMonitor, IconSmartphone,
    IconTablet, IconMapPin, IconClock, IconShoppingCart, IconLink, IconSearch,
    IconX, IconLock, IconUser, IconEye, IconEyeOff, IconCheck, IconAlertCircle,
    IconFire, IconFile, IconMenu
} from '@/components/Icons';

export default function AdminDashboard() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [visitors, setVisitors] = useState([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [dateRange, setDateRange] = useState(30);
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    // Settings state
    const [settingsForm, setSettingsForm] = useState({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [settingsLoading, setSettingsLoading] = useState(false);

    // Form states
    const [fetchUrl, setFetchUrl] = useState('');
    const [fetching, setFetching] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        category: 'Electronics',
        platform: 'Amazon',
        affiliateLink: '',
    });
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchProducts();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        if (activeTab === 'analytics' || activeTab === 'visitors') {
            fetchAnalytics();
        }
    }, [dateRange, activeTab]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            showToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch(`/api/analytics?days=${dateRange}&visitors=true`);
            const data = await res.json();
            setAnalytics(data);
            setVisitors(data.visitors || []);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleFetchProduct = async () => {
        if (!fetchUrl.trim()) {
            showToast('Please enter a product URL', 'error');
            return;
        }

        setFetching(true);
        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: fetchUrl }),
            });

            const data = await res.json();

            setFormData({
                title: data.title || '',
                description: data.description || '',
                price: data.price?.toString() || '',
                originalPrice: data.originalPrice?.toString() || '',
                image: data.image || '',
                category: data.category || 'Electronics',
                platform: data.platform || 'Amazon',
                affiliateLink: data.affiliateLink || fetchUrl,
            });

            showToast(data.fetchFailed ? 'Partial data fetched' : 'Product details fetched!', data.fetchFailed ? 'warning' : 'success');
            setActiveTab('add');
            setSidebarOpen(false);
        } catch (error) {
            showToast('Failed to fetch product details', 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: parseInt(formData.price) || 0,
            originalPrice: parseInt(formData.originalPrice) || 0,
        };

        try {
            if (editingId) {
                await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...productData }),
                });
                showToast('Product updated!');
            } else {
                await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                });
                showToast('Product added!');
            }

            resetForm();
            fetchProducts();
            setActiveTab('products');
        } catch (error) {
            showToast('Failed to save product', 'error');
        }
    };

    const handleEdit = (product) => {
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price?.toString(),
            originalPrice: product.originalPrice?.toString(),
            image: product.image,
            category: product.category,
            platform: product.platform,
            affiliateLink: product.affiliateLink,
        });
        setEditingId(product.id);
        setActiveTab('add');
        setSidebarOpen(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;

        try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            showToast('Product deleted!');
            fetchProducts();
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    const handleUpdateCredentials = async (e) => {
        e.preventDefault();

        if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (!settingsForm.currentPassword) {
            showToast('Enter current password', 'error');
            return;
        }

        setSettingsLoading(true);
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    currentPassword: settingsForm.currentPassword,
                    newUsername: settingsForm.newUsername || undefined,
                    newPassword: settingsForm.newPassword || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                showToast('Credentials updated! Please login again.', 'success');
                setSettingsForm({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    localStorage.removeItem('adminToken');
                    router.push('/admin');
                }, 2000);
            } else {
                showToast(data.error || 'Failed to update', 'error');
            }
        } catch (error) {
            showToast('Failed to update credentials', 'error');
        } finally {
            setSettingsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '', price: '', originalPrice: '',
            image: '', category: 'Electronics', platform: 'Amazon', affiliateLink: '',
        });
        setEditingId(null);
        setFetchUrl('');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0,
        }).format(price || 0);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-IN', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const exportAnalytics = () => {
        if (!analytics) return;

        let csv = 'DealsHub Analytics Export\n\n';
        csv += 'Summary\nMetric,Value\n';
        csv += `Total Visitors,${analytics.summary?.totalVisitors || 0}\n`;
        csv += `Unique Visitors,${analytics.summary?.uniqueVisitors || 0}\n`;
        csv += `Total Clicks,${analytics.summary?.totalClicks || 0}\n`;
        csv += `Click Rate,${analytics.summary?.conversionRate || 0}%\n\n`;

        csv += 'Daily Traffic\nDate,Visitors,Clicks\n';
        (analytics.chartData || []).forEach(day => {
            csv += `${day.date},${day.visitors},${day.clicks}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_${dateRange}d_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Exported!');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab !== 'add') resetForm();
        setSelectedVisitor(null);
        setSidebarOpen(false);
    };

    const getDeviceIcon = (device) => {
        switch (device?.toLowerCase()) {
            case 'mobile': return <IconSmartphone size={18} />;
            case 'tablet': return <IconTablet size={18} />;
            default: return <IconMonitor size={18} />;
        }
    };

    return (
        <div className="admin-layout-v2">
            {/* Mobile Header */}
            <div className="admin-mobile-header-v2">
                <button className="admin-menu-btn-v2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <IconMenu size={20} />
                </button>
                <div className="admin-mobile-logo">
                    <IconFire size={24} className="text-accent" />
                    <span className="admin-logo-text">DealsHub</span>
                </div>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Sidebar Overlay */}
            <div
                className={`admin-sidebar-overlay-v2 ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Premium Sidebar */}
            <aside className={`admin-sidebar-v2 ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-brand">
                        <IconFire size={28} className="text-accent" />
                        <span className="admin-logo-text">DealsHub</span>
                    </div>
                    <span className="admin-sidebar-badge">Admin</span>
                </div>

                <nav className="admin-sidebar-nav-v2">
                    <div className="admin-nav-section">
                        <span className="admin-nav-section-title">Dashboard</span>
                        <button
                            className={`admin-nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => handleTabChange('analytics')}
                        >
                            <IconBarChart size={18} className="admin-nav-icon" />
                            <span className="admin-nav-text">Analytics</span>
                            <span className="admin-nav-badge">{analytics?.summary?.totalClicks || 0}</span>
                        </button>
                        <button
                            className={`admin-nav-link ${activeTab === 'visitors' ? 'active' : ''}`}
                            onClick={() => handleTabChange('visitors')}
                        >
                            <IconUsers size={18} className="admin-nav-icon" />
                            <span className="admin-nav-text">Visitors</span>
                            <span className="admin-nav-badge">{visitors.length}</span>
                        </button>
                    </div>

                    <div className="admin-nav-section">
                        <span className="admin-nav-section-title">Products</span>
                        <button
                            className={`admin-nav-link ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => handleTabChange('products')}
                        >
                            <IconPackage size={18} className="admin-nav-icon" />
                            <span className="admin-nav-text">All Products</span>
                            <span className="admin-nav-badge">{products.length}</span>
                        </button>
                        <button
                            className={`admin-nav-link ${activeTab === 'add' ? 'active' : ''}`}
                            onClick={() => handleTabChange('add')}
                        >
                            <IconPlus size={18} className="admin-nav-icon" />
                            <span className="admin-nav-text">Add Product</span>
                        </button>
                    </div>

                    <div className="admin-nav-section">
                        <span className="admin-nav-section-title">System</span>
                        <button
                            className={`admin-nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => handleTabChange('settings')}
                        >
                            <IconSettings size={18} className="admin-nav-icon" />
                            <span className="admin-nav-text">Settings</span>
                        </button>
                        <Link href="/" className="admin-nav-link" target="_blank">
                            <IconGlobe size={18} className="admin-nav-icon" />
                            <span className="admin-nav-text">View Website</span>
                            <IconExternalLink size={14} className="admin-nav-arrow" />
                        </Link>
                    </div>
                </nav>

                <div className="admin-sidebar-footer-v2">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">
                            <IconUser size={18} />
                        </div>
                        <div className="admin-user-details">
                            <span className="admin-user-name">Administrator</span>
                            <span className="admin-user-role">Full Access</span>
                        </div>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <IconLogout size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main-v2">
                {/* Top Bar */}
                <div className="admin-topbar">
                    <div className="admin-topbar-left">
                        <h1 className="admin-page-title">
                            {activeTab === 'analytics' && <><IconBarChart size={24} /> Analytics</>}
                            {activeTab === 'visitors' && <><IconUsers size={24} /> Visitors</>}
                            {activeTab === 'products' && <><IconPackage size={24} /> Products</>}
                            {activeTab === 'add' && <>{editingId ? <IconEdit size={24} /> : <IconPlus size={24} />} {editingId ? 'Edit' : 'Add'} Product</>}
                            {activeTab === 'settings' && <><IconSettings size={24} /> Settings</>}
                        </h1>
                        <p className="admin-page-subtitle">
                            {activeTab === 'analytics' && 'Track website performance'}
                            {activeTab === 'visitors' && `${visitors.length} visitors tracked`}
                            {activeTab === 'products' && `${products.length} products`}
                            {activeTab === 'add' && 'Add via URL or manually'}
                            {activeTab === 'settings' && 'Manage admin credentials'}
                        </p>
                    </div>
                    <div className="admin-topbar-actions">
                        {activeTab !== 'add' && activeTab !== 'settings' && (
                            <button className="admin-btn-primary" onClick={() => handleTabChange('add')}>
                                <IconPlus size={16} /> Add Product
                            </button>
                        )}
                    </div>
                </div>

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="admin-content-grid">
                        <div className="admin-filters-bar">
                            <div className="admin-date-selector">
                                {[7, 14, 30, 90].map(days => (
                                    <button
                                        key={days}
                                        className={`admin-date-btn ${dateRange === days ? 'active' : ''}`}
                                        onClick={() => setDateRange(days)}
                                    >
                                        {days}D
                                    </button>
                                ))}
                            </div>
                            <div className="admin-filter-actions">
                                <button className="admin-btn-secondary" onClick={fetchAnalytics}>
                                    <IconRefresh size={16} /> Refresh
                                </button>
                                <button className="admin-btn-secondary" onClick={exportAnalytics}>
                                    <IconDownload size={16} /> Export
                                </button>
                            </div>
                        </div>

                        {analyticsLoading ? (
                            <div className="admin-loading-state">
                                <div className="admin-loading-spinner"></div>
                                <p>Loading analytics...</p>
                            </div>
                        ) : (
                            <>
                                <div className="admin-stats-grid">
                                    <div className="admin-stat-card-v2 highlight">
                                        <div className="admin-stat-icon-v2"><IconUsers size={24} /></div>
                                        <div className="admin-stat-content">
                                            <span className="admin-stat-value-v2">{analytics?.summary?.totalVisitors || 0}</span>
                                            <span className="admin-stat-label-v2">Total Visitors</span>
                                        </div>
                                    </div>
                                    <div className="admin-stat-card-v2">
                                        <div className="admin-stat-icon-v2"><IconTarget size={24} /></div>
                                        <div className="admin-stat-content">
                                            <span className="admin-stat-value-v2">{analytics?.summary?.uniqueVisitors || 0}</span>
                                            <span className="admin-stat-label-v2">Unique Sessions</span>
                                        </div>
                                    </div>
                                    <div className="admin-stat-card-v2">
                                        <div className="admin-stat-icon-v2"><IconClick size={24} /></div>
                                        <div className="admin-stat-content">
                                            <span className="admin-stat-value-v2">{analytics?.summary?.totalClicks || 0}</span>
                                            <span className="admin-stat-label-v2">Product Clicks</span>
                                        </div>
                                    </div>
                                    <div className="admin-stat-card-v2">
                                        <div className="admin-stat-icon-v2"><IconTrendingUp size={24} /></div>
                                        <div className="admin-stat-content">
                                            <span className="admin-stat-value-v2">{analytics?.summary?.conversionRate || 0}%</span>
                                            <span className="admin-stat-label-v2">Click Rate</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-charts-row">
                                    <div className="admin-chart-card-v2 wide">
                                        <div className="admin-chart-header">
                                            <h3><IconBarChart size={18} /> Traffic Overview</h3>
                                            <div className="admin-chart-legend">
                                                <span className="legend-item visitors">● Visitors</span>
                                                <span className="legend-item clicks">● Clicks</span>
                                            </div>
                                        </div>
                                        <LineChart data={analytics?.chartData || []} dataKeys={['visitors', 'clicks']} colors={['#6366f1', '#22c55e']} height={280} />
                                    </div>
                                    <div className="admin-chart-card-v2">
                                        <div className="admin-chart-header"><h3><IconMonitor size={18} /> Devices</h3></div>
                                        <DonutChart data={analytics?.devices || {}} colors={['#6366f1', '#8b5cf6', '#a855f7']} size={150} />
                                    </div>
                                </div>

                                <div className="admin-charts-row">
                                    <div className="admin-chart-card-v2">
                                        <div className="admin-chart-header"><h3><IconShoppingCart size={18} /> Top Products</h3></div>
                                        <BarChart
                                            data={analytics?.topProducts?.slice(0, 5) || []}
                                            labelKey="productTitle"
                                            valueKey="count"
                                            color={(item) => item.platform?.toLowerCase() === 'amazon' ? '#ff9900' :
                                                item.platform?.toLowerCase() === 'flipkart' ? '#2874f0' : '#6366f1'}
                                            height={200}
                                        />
                                    </div>
                                    <div className="admin-chart-card-v2">
                                        <div className="admin-chart-header"><h3><IconLink size={18} /> Traffic Sources</h3></div>
                                        <BarChart data={analytics?.sources || []} labelKey="name" valueKey="count" color="#6366f1" height={200} />
                                    </div>
                                </div>

                                <div className="admin-activity-card">
                                    <div className="admin-card-header">
                                        <h3><IconClock size={18} /> Recent Clicks</h3>
                                        <button className="admin-btn-text" onClick={() => handleTabChange('visitors')}>View All →</button>
                                    </div>
                                    <div className="admin-activity-list">
                                        {analytics?.recentClicks?.slice(0, 5).map((click, i) => (
                                            <div key={i} className="admin-activity-item">
                                                <div className="admin-activity-icon"><IconShoppingCart size={18} /></div>
                                                <div className="admin-activity-content">
                                                    <span className="admin-activity-title">{click.productTitle?.substring(0, 40)}...</span>
                                                    <span className="admin-activity-meta">
                                                        <span className={`platform-badge ${click.platform?.toLowerCase()}`}>{click.platform}</span>
                                                        • {formatPrice(click.price)}
                                                    </span>
                                                </div>
                                                <span className="admin-activity-time">{formatTimeAgo(click.timestamp)}</span>
                                            </div>
                                        ))}
                                        {(!analytics?.recentClicks || analytics.recentClicks.length === 0) && (
                                            <div className="admin-empty-activity">No clicks recorded</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Visitors Tab */}
                {activeTab === 'visitors' && (
                    <div className="admin-content-grid">
                        <div className="admin-filters-bar">
                            <div className="admin-date-selector">
                                {[7, 14, 30, 90].map(days => (
                                    <button key={days} className={`admin-date-btn ${dateRange === days ? 'active' : ''}`} onClick={() => setDateRange(days)}>
                                        {days}D
                                    </button>
                                ))}
                            </div>
                            <button className="admin-btn-secondary" onClick={fetchAnalytics}><IconRefresh size={16} /> Refresh</button>
                        </div>

                        {analyticsLoading ? (
                            <div className="admin-loading-state"><div className="admin-loading-spinner"></div><p>Loading...</p></div>
                        ) : (
                            <div className="admin-visitors-layout">
                                <div className="admin-visitors-list-card">
                                    <div className="admin-card-header"><h3><IconUsers size={18} /> All Visitors ({visitors.length})</h3></div>
                                    <div className="admin-visitors-list">
                                        {visitors.map((visitor, i) => (
                                            <div
                                                key={i}
                                                className={`admin-visitor-item ${selectedVisitor?.sessionId === visitor.sessionId ? 'active' : ''}`}
                                                onClick={() => setSelectedVisitor(visitor)}
                                            >
                                                <div className="admin-visitor-avatar">{getDeviceIcon(visitor.device)}</div>
                                                <div className="admin-visitor-info">
                                                    <div className="admin-visitor-location">
                                                        <span className="admin-visitor-city">{visitor.location?.city || 'Local'}</span>
                                                        <span className="admin-visitor-country">{visitor.location?.country || 'Dev'}</span>
                                                    </div>
                                                    <div className="admin-visitor-meta">
                                                        <span>{visitor.device}</span> • <span>{visitor.browser}</span> • <span>{visitor.pageViews} pages</span>
                                                    </div>
                                                </div>
                                                <div className="admin-visitor-right">
                                                    <span className="admin-visitor-time">{formatTimeAgo(visitor.lastVisit)}</span>
                                                    {visitor.clicks?.length > 0 && (
                                                        <span className="admin-visitor-clicks-badge">{visitor.clicks.length} clicks</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {visitors.length === 0 && <div className="admin-empty-state-v2"><IconUsers size={40} /><p>No visitors yet</p></div>}
                                    </div>
                                </div>

                                <div className="admin-visitor-detail-card">
                                    {selectedVisitor ? (
                                        <>
                                            <div className="admin-card-header">
                                                <h3>Visitor Details</h3>
                                                <button className="admin-btn-icon" onClick={() => setSelectedVisitor(null)}><IconX size={18} /></button>
                                            </div>
                                            <div className="admin-visitor-detail-content">
                                                <div className="admin-detail-section">
                                                    <h4><IconMapPin size={16} /> Location</h4>
                                                    <div className="admin-detail-grid">
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">City</span>
                                                            <span className="admin-detail-value">{selectedVisitor.location?.city || 'Local'}</span>
                                                        </div>
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Country</span>
                                                            <span className="admin-detail-value">{selectedVisitor.location?.country || 'Development'}</span>
                                                        </div>
                                                        <div className="admin-detail-item full">
                                                            <span className="admin-detail-label">IP Address</span>
                                                            <span className="admin-detail-value mono">{selectedVisitor.ip}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="admin-detail-section">
                                                    <h4><IconMonitor size={16} /> Device & Browser</h4>
                                                    <div className="admin-detail-grid">
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Device</span>
                                                            <span className="admin-detail-value">{selectedVisitor.device}</span>
                                                        </div>
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Browser</span>
                                                            <span className="admin-detail-value">{selectedVisitor.browser}</span>
                                                        </div>
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Language</span>
                                                            <span className="admin-detail-value">{selectedVisitor.language}</span>
                                                        </div>
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Timezone</span>
                                                            <span className="admin-detail-value">{selectedVisitor.timezone}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="admin-detail-section">
                                                    <h4><IconClock size={16} /> Activity</h4>
                                                    <div className="admin-detail-grid">
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">First Visit</span>
                                                            <span className="admin-detail-value">{formatTime(selectedVisitor.firstVisit)}</span>
                                                        </div>
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Last Visit</span>
                                                            <span className="admin-detail-value">{formatTime(selectedVisitor.lastVisit)}</span>
                                                        </div>
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Pages</span>
                                                            <span className="admin-detail-value">{selectedVisitor.pageViews}</span>
                                                        </div>
                                                        <div className="admin-detail-item">
                                                            <span className="admin-detail-label">Source</span>
                                                            <span className="admin-detail-value">{selectedVisitor.referrer}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="admin-detail-section">
                                                    <h4><IconFile size={16} /> Pages Visited</h4>
                                                    <div className="admin-pages-list">
                                                        {selectedVisitor.pages?.map((page, i) => (
                                                            <span key={i} className="admin-page-tag">{page}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {selectedVisitor.clicks?.length > 0 && (
                                                    <div className="admin-detail-section">
                                                        <h4><IconShoppingCart size={16} /> Clicks ({selectedVisitor.clicks.length})</h4>
                                                        <div className="admin-clicks-list">
                                                            {selectedVisitor.clicks.map((click, i) => (
                                                                <div key={i} className="admin-click-item">
                                                                    <div className="admin-click-info">
                                                                        <span className="admin-click-title">{click.productTitle?.substring(0, 30)}...</span>
                                                                        <span className="admin-click-meta">
                                                                            <span className={`platform-badge ${click.platform?.toLowerCase()}`}>{click.platform}</span>
                                                                            {formatPrice(click.price)}
                                                                        </span>
                                                                    </div>
                                                                    <span className="admin-click-time">{formatTime(click.timestamp)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="admin-visitor-detail-empty"><IconUsers size={48} /><p>Select a visitor</p></div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="admin-content-grid">
                        {loading ? (
                            <div className="admin-loading-state"><div className="admin-loading-spinner"></div><p>Loading...</p></div>
                        ) : products.length === 0 ? (
                            <div className="admin-empty-state-v2 large">
                                <IconPackage size={60} />
                                <h3>No products yet</h3>
                                <p>Add your first affiliate product</p>
                                <button className="admin-btn-primary" onClick={() => handleTabChange('add')}><IconPlus size={16} /> Add Product</button>
                            </div>
                        ) : (
                            <div className="admin-products-grid">
                                {products.map((product) => (
                                    <div key={product.id} className="admin-product-card-v2">
                                        <div className="admin-product-image-v2">
                                            <img
                                                src={product.image || 'https://via.placeholder.com/200x150/1a1a25/6366f1?text=No+Image'}
                                                alt={product.title}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150/1a1a25/6366f1?text=No+Image'; }}
                                            />
                                            <span className={`admin-product-platform ${product.platform?.toLowerCase()}`}>{product.platform}</span>
                                        </div>
                                        <div className="admin-product-content-v2">
                                            <h4 className="admin-product-title-v2">{product.title?.substring(0, 50)}...</h4>
                                            <div className="admin-product-pricing-v2">
                                                <span className="admin-product-price-v2">{formatPrice(product.price)}</span>
                                                {product.originalPrice > product.price && (
                                                    <span className="admin-product-original-v2">{formatPrice(product.originalPrice)}</span>
                                                )}
                                            </div>
                                            <div className="admin-product-actions-v2">
                                                <button className="admin-btn-edit" onClick={() => handleEdit(product)}><IconEdit size={14} /> Edit</button>
                                                <button className="admin-btn-delete" onClick={() => handleDelete(product.id)}><IconTrash size={14} /> Delete</button>
                                                <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="admin-btn-view">
                                                    <IconExternalLink size={14} /> View
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Add Product Tab */}
                {activeTab === 'add' && (
                    <div className="admin-content-grid">
                        <div className="admin-form-card">
                            <div className="admin-form-section-v2">
                                <div className="admin-section-header">
                                    <IconLink size={24} className="admin-section-icon" />
                                    <div>
                                        <h3>Quick Add from URL</h3>
                                        <p>Paste product URL from Amazon, Flipkart, or Myntra</p>
                                    </div>
                                </div>
                                <div className="admin-url-input-group">
                                    <input
                                        type="url"
                                        className="admin-input-v2"
                                        placeholder="https://amazon.in/dp/..."
                                        value={fetchUrl}
                                        onChange={(e) => setFetchUrl(e.target.value)}
                                    />
                                    <button className="admin-btn-primary" onClick={handleFetchProduct} disabled={fetching}>
                                        {fetching ? 'Fetching...' : <><IconSearch size={16} /> Fetch</>}
                                    </button>
                                </div>
                            </div>

                            <div className="admin-form-divider-v2"><span>or enter manually</span></div>

                            <form onSubmit={handleSubmit} className="admin-form-v2">
                                <div className="admin-form-group-v2">
                                    <label>Product Title *</label>
                                    <input type="text" className="admin-input-v2" placeholder="Enter title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                </div>

                                <div className="admin-form-group-v2">
                                    <label>Description</label>
                                    <textarea className="admin-input-v2" placeholder="Enter description" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div className="admin-form-row-v2">
                                    <div className="admin-form-group-v2">
                                        <label>Price (₹) *</label>
                                        <input type="number" className="admin-input-v2" placeholder="1999" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                    <div className="admin-form-group-v2">
                                        <label>Original Price (₹)</label>
                                        <input type="number" className="admin-input-v2" placeholder="2999" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} />
                                    </div>
                                </div>

                                <div className="admin-form-group-v2">
                                    <label>Image URL</label>
                                    <input type="url" className="admin-input-v2" placeholder="https://..." value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                                    {formData.image && <img src={formData.image} alt="Preview" className="admin-image-preview" onError={(e) => { e.target.style.display = 'none'; }} />}
                                </div>

                                <div className="admin-form-row-v2">
                                    <div className="admin-form-group-v2">
                                        <label>Platform *</label>
                                        <select className="admin-input-v2" value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })}>
                                            <option value="Amazon">Amazon</option>
                                            <option value="Flipkart">Flipkart</option>
                                            <option value="Myntra">Myntra</option>
                                            <option value="Ajio">Ajio</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="admin-form-group-v2">
                                        <label>Category</label>
                                        <select className="admin-input-v2" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Home">Home & Kitchen</option>
                                            <option value="Beauty">Beauty</option>
                                            <option value="Sports">Sports</option>
                                            <option value="Books">Books</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="admin-form-group-v2">
                                    <label>Affiliate Link *</label>
                                    <input type="url" className="admin-input-v2" placeholder="https://..." value={formData.affiliateLink} onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })} required />
                                </div>

                                <div className="admin-form-actions-v2">
                                    <button type="submit" className="admin-btn-primary large">
                                        {editingId ? <><IconCheck size={18} /> Update Product</> : <><IconPlus size={18} /> Add Product</>}
                                    </button>
                                    <button type="button" className="admin-btn-secondary large" onClick={() => handleTabChange('products')}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="admin-content-grid">
                        <div className="admin-form-card">
                            <div className="admin-section-header">
                                <IconLock size={24} className="admin-section-icon" />
                                <div>
                                    <h3>Change Admin Credentials</h3>
                                    <p>Update your username or password</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateCredentials} className="admin-form-v2">
                                <div className="admin-form-group-v2">
                                    <label>Current Password *</label>
                                    <div className="admin-input-password">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            className="admin-input-v2"
                                            placeholder="Enter current password"
                                            value={settingsForm.currentPassword}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                                            required
                                        />
                                        <button type="button" className="admin-password-toggle" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                                            {showPasswords.current ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="admin-form-group-v2">
                                    <label>New Username (optional)</label>
                                    <input
                                        type="text"
                                        className="admin-input-v2"
                                        placeholder="Leave empty to keep current"
                                        value={settingsForm.newUsername}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, newUsername: e.target.value })}
                                    />
                                </div>

                                <div className="admin-form-group-v2">
                                    <label>New Password (optional)</label>
                                    <div className="admin-input-password">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            className="admin-input-v2"
                                            placeholder="Leave empty to keep current"
                                            value={settingsForm.newPassword}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                                        />
                                        <button type="button" className="admin-password-toggle" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                                            {showPasswords.new ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {settingsForm.newPassword && (
                                    <div className="admin-form-group-v2">
                                        <label>Confirm New Password</label>
                                        <div className="admin-input-password">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                className="admin-input-v2"
                                                placeholder="Confirm new password"
                                                value={settingsForm.confirmPassword}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                                            />
                                            <button type="button" className="admin-password-toggle" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                                                {showPasswords.confirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="admin-form-actions-v2">
                                    <button type="submit" className="admin-btn-primary large" disabled={settingsLoading}>
                                        {settingsLoading ? 'Updating...' : <><IconCheck size={18} /> Update Credentials</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <div className={`admin-toast ${toast.type}`}>
                    {toast.type === 'success' && <IconCheck size={18} />}
                    {toast.type === 'error' && <IconAlertCircle size={18} />}
                    {toast.type === 'warning' && <IconAlertCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}
