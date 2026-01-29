import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Package, ChevronDown, ChevronUp } from 'lucide-react';

function SearchPage() {
    const [products, setProducts] = useState([]);
    const [allBrands, setAllBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [discountFilters, setDiscountFilters] = useState([]);
    const [sortOrder, setSortOrder] = useState('default');

    const [showAllBrands, setShowAllBrands] = useState(false);
    const [filterSearchTerm, setFilterSearchTerm] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    const POPULAR_BRANDS_STUB = [
        "Apple", "Samsung", "Sony", "LG", "ASUS", "HP", "Logitech",
        "MSI", "Intel", "Nvidia", "Dell", "Lenovo", "Xiaomi", "Huawei", "Microsoft"
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        setSearchQuery(query);

        if (query) {
            fetchSearchResults(query);
        }
        fetchAllBrands();
    }, [location.search]);

    const fetchAllBrands = async () => {
        try {
            const response = await fetch('/api/home/Product/all-brands');
            if (response.ok) {
                const data = await response.json();
                const brandsArray = Array.isArray(data) ? data : (data.$values || []);
                const combined = [...new Set([...brandsArray, ...POPULAR_BRANDS_STUB])];
                setAllBrands(combined.sort());
            } else {
                setAllBrands(POPULAR_BRANDS_STUB.sort());
            }
        } catch (err) {
            setAllBrands(POPULAR_BRANDS_STUB.sort());
        }
    };

    const fetchSearchResults = async (query) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/home/Product/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                const productsArray = Array.isArray(data) ? data : (data.$values || []);
                setProducts(productsArray);
            } else {
                setError('Failed to fetch search results.');
            }
        } catch (err) {
            setError('Connection error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const processedProducts = useMemo(() => {
        let result = [...products];

        if (minPrice) result = result.filter(p => p.finalPrice >= parseFloat(minPrice));
        if (maxPrice) result = result.filter(p => p.finalPrice <= parseFloat(maxPrice));

        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brand));
        }

        if (discountFilters.length > 0) {
            result = result.filter(p => {
                const hasDiscount = p.hasActiveDiscount;
                if (discountFilters.includes('with-discount') && hasDiscount) return true;
                if (discountFilters.includes('without-discount') && !hasDiscount) return true;
                return false;
            });
        }

        if (sortOrder === 'price-asc') result.sort((a, b) => a.finalPrice - b.finalPrice);
        else if (sortOrder === 'price-desc') result.sort((a, b) => b.finalPrice - a.finalPrice);
        else if (sortOrder === 'name-asc') result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        return result;
    }, [products, minPrice, maxPrice, selectedBrands, discountFilters, sortOrder]);

    const handleBrandToggle = (brand) => {
        setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    };

    const handleDiscountToggle = (type) => {
        setDiscountFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const resetFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedBrands([]);
        setDiscountFilters([]);
        setSortOrder('default');
    };

    const hasActiveFilters = minPrice || maxPrice || selectedBrands.length > 0 || discountFilters.length > 0;

    const filteredBrands = useMemo(() => {
        if (!filterSearchTerm) return allBrands;
        return allBrands.filter(brand => brand.toLowerCase().includes(filterSearchTerm.toLowerCase()));
    }, [allBrands, filterSearchTerm]);

    const brandCounts = useMemo(() => {
        const counts = {};
        products.forEach(p => { if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1; });
        return counts;
    }, [products]);

    const discountCounts = useMemo(() => {
        return {
            with: products.filter(p => p.hasActiveDiscount).length,
            without: products.filter(p => !p.hasActiveDiscount).length
        };
    }, [products]);

    if (loading) {
        return (
            <div className="container mt-5 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Searching...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-lg-5 mt-4 mb-5" style={{ minHeight: '80vh' }}>
            <nav aria-label="breadcrumb" className="mb-4">
                <Link to="/" className="text-decoration-none text-muted small d-flex align-items-center gap-1">
                    <ArrowLeft size={14} /> Back to Home
                </Link>
            </nav>

            <div className="row">
                <aside className="col-lg-3 pe-lg-4">
                    <div className="sticky-top" style={{ top: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                                <Filter size={18} /> Filters
                            </h5>
                            {hasActiveFilters && (
                                <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" onClick={resetFilters}>
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="mb-3">
                            <div className="position-relative">
                                <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    className="form-control form-control-sm ps-5"
                                    placeholder="Search filters..."
                                    value={filterSearchTerm}
                                    onChange={(e) => setFilterSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-3 p-3">
                            <label className="fw-bold small mb-2">Offer Type</label>
                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input shadow-none"
                                    type="checkbox"
                                    id="filter-with-discount"
                                    checked={discountFilters.includes('with-discount')}
                                    onChange={() => handleDiscountToggle('with-discount')}
                                />
                                <label className="form-check-label small cursor-pointer d-flex justify-content-between w-100" htmlFor="filter-with-discount">
                                    <span>With Discount</span>
                                    <span className="text-muted">({discountCounts.with})</span>
                                </label>
                            </div>
                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input shadow-none"
                                    type="checkbox"
                                    id="filter-without-discount"
                                    checked={discountFilters.includes('without-discount')}
                                    onChange={() => handleDiscountToggle('without-discount')}
                                />
                                <label className="form-check-label small cursor-pointer d-flex justify-content-between w-100" htmlFor="filter-without-discount">
                                    <span>Without Discount</span>
                                    <span className="text-muted">({discountCounts.without})</span>
                                </label>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-3 p-3">
                            <label className="fw-bold small mb-2">Brands</label>
                            <div className="brand-scroll-box" style={{ maxHeight: showAllBrands ? 'none' : '200px', overflowY: 'auto' }}>
                                {filteredBrands.slice(0, showAllBrands ? filteredBrands.length : 8).map(brand => (
                                    <div key={brand} className="form-check mb-2">
                                        <input
                                            className="form-check-input shadow-none"
                                            type="checkbox"
                                            id={`brand-${brand}`}
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => handleBrandToggle(brand)}
                                        />
                                        <label className="form-check-label small cursor-pointer d-flex justify-content-between w-100" htmlFor={`brand-${brand}`}>
                                            <span>{brand}</span>
                                            <span className="text-muted">({brandCounts[brand] || 0})</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {filteredBrands.length > 8 && (
                                <button className="btn btn-link btn-sm p-0 text-decoration-none mt-2 small" onClick={() => setShowAllBrands(!showAllBrands)}>
                                    {showAllBrands ? 'Show Less' : `Show More (${filteredBrands.length - 8})`}
                                </button>
                            )}
                        </div>

                        <div className="card border-0 shadow-sm mb-3 p-3">
                            <label className="fw-bold small mb-3">Price Range (USD)</label>
                            <div className="d-flex align-items-center gap-2">
                                <input type="number" className="form-control form-control-sm" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                                <input type="number" className="form-control form-control-sm" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="col-lg-9 mt-4 mt-lg-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 bg-white p-3 rounded shadow-sm gap-3">
                        <div>
                            <h1 className="h4 mb-1 fw-bold">Search Results</h1>
                            <p className="text-muted small m-0">Found <strong>{processedProducts.length}</strong> products for <span className="text-primary fw-semibold">"{searchQuery}"</span></p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <label className="small text-muted">Sort:</label>
                            <select className="form-select form-select-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ width: '180px' }}>
                                <option value="default">Relevance</option>
                                <option value="price-asc">Cheapest</option>
                                <option value="price-desc">Most Expensive</option>
                                <option value="name-asc">Name: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {processedProducts.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                            {processedProducts.map((p) => (
                                <div key={p.id} className="card border-0 shadow-sm overflow-hidden" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                                    <div className="d-flex flex-column flex-md-row p-3 gap-4">
                                        <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ width: '160px', height: '160px', minWidth: '160px' }}>
                                            <img src={p.imageUrls?.[0] || 'https://via.placeholder.com/160'} alt={p.name} className="img-fluid" style={{ maxHeight: '140px', objectFit: 'contain' }} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="fw-bold mb-1">{p.name}</h5>
                                            <div className="mb-2">
                                                <span className="badge bg-light text-dark border me-2">{p.brand}</span>
                                                <span className="text-muted small">{p.productCategoryName}</span>
                                            </div>
                                            <p className="text-muted small d-none d-md-block mb-3">{p.description?.substring(0, 150)}...</p>
                                            <div className={`small d-flex align-items-center gap-1 ${p.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                                                <Package size={14} /> {p.quantity > 0 ? `In Stock (${p.quantity})` : 'Out of Stock'}
                                            </div>
                                        </div>
                                        <div className="text-end border-start ps-4" style={{ minWidth: '180px' }}>
                                            <div className="mb-4">
                                                {p.hasActiveDiscount ? (
                                                    <>
                                                        <div className="text-decoration-line-through text-muted small">{p.price.toFixed(2)} zl</div>
                                                        <div className="h3 fw-bold text-danger mb-0">{p.finalPrice.toFixed(2)} zl</div>
                                                    </>
                                                ) : (
                                                    <div className="h3 fw-bold text-dark mb-0">{p.price.toFixed(2)} zl</div>
                                                )}
                                            </div>
                                            <button className="btn btn-dark btn-sm w-100 fw-bold" disabled={p.quantity <= 0}>Add to Cart</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5 bg-white rounded shadow-sm border mt-4">
                            <Search size={64} className="text-muted opacity-25 mb-4" />
                            <h3 className="h5 fw-bold">No products found</h3>
                            <p className="text-muted mb-4">Try changing your search criteria or resetting filters.</p>
                            <button className="btn btn-primary px-4 fw-bold" onClick={resetFilters}>Reset All Filters</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default SearchPage;