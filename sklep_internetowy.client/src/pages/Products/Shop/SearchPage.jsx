import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Trash2, Package, Check, Tag } from 'lucide-react';
import { useCart } from "../../../context/CartContext";

/**
 * @file SearchPage.jsx
 * @brief Komponent strony wynikow wyszukiwania z zaawansowanym filtrowaniem i sortowaniem.
 * @details Modul odpowiada za prezentacje wynikow wyszukiwania tekstowego, umozliwiajac 
 * uzytkownikowi dynamiczne zawezanie listy produktow wedlug ceny, marki oraz statusu promocji.
 */

/**
 * @component SearchPage
 * @description Glowny komponent strony wyszukiwania. Zarzadza stanem wynikow pobranych z API, 
 * lista producentow oraz kompleksowa logika filtrow po stronie klienta.
 */
function SearchPage() {
    /** @brief Stan przechowujacy surowa liste produktow zwrocona przez wyszukiwarke API. */
    const [products, setProducts] = useState([]);
    /** @brief Lista wszystkich dostepnych marek (pobrana z API lub zdefiniowana domyslnie). */
    const [allBrands, setAllBrands] = useState([]);
    /** @brief Flaga logiczna okreslajaca stan ladowania danych. */
    const [loading, setLoading] = useState(false);
    /** @brief Tresc bledu w przypadku problemow z polaczeniem lub serwerem. */
    const [error, setError] = useState('');
    /** @brief Aktualnie wyszukiwana fraza tekstowa wyodrebniona z adresu URL. */
    const [searchQuery, setSearchQuery] = useState('');

    /** @brief Stan filtrow cenowych (cena minimalna i maksymalna). */
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    /** @brief Tablica wybranych identyfikatorow marek do filtrowania. */
    const [selectedBrands, setSelectedBrands] = useState([]);
    /** @brief Flaga filtrujaca wylacznie produkty objete aktywna promocja. */
    const [onlyPromoted, setOnlyPromoted] = useState(false);
    /** @brief Wybrany tryb sortowania wynikow (domyslny, cena, nazwa). */
    const [sortOrder, setSortOrder] = useState('default');

    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    /** @brief Lista popularnych marek uzywana jako fallback w przypadku braku danych z bazy. */
    const POPULAR_BRANDS_STUB = [
        "Apple", "Samsung", "Sony", "LG", "ASUS", "HP", "Logitech",
        "MSI", "Intel", "Nvidia", "Dell", "Lenovo", "Xiaomi", "Huawei", "Microsoft"
    ];

    /**
     * @effect Inicjalizacja danych przy kazdej zmianie parametrow URL.
     * @description Pobiera aktualna fraze wyszukiwania (q) i wywoluje funkcje API.
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        setSearchQuery(query);

        if (query) {
            fetchSearchResults(query);
        }
        fetchAllBrands();
    }, [location.search]);

    /**
     * @function fetchAllBrands
     * @async
     * @description Pobiera unikalna liste marek produktow z bazy danych w celu wypelnienia filtra bocznego.
     */
    const fetchAllBrands = async () => {
        try {
            const response = await fetch('/api/panel/Product/all-brands');
            if (response.ok) {
                const data = await response.json();
                const combined = [...new Set([...data, ...POPULAR_BRANDS_STUB])];
                setAllBrands(combined.sort());
            } else {
                setAllBrands(POPULAR_BRANDS_STUB.sort());
            }
        } catch (err) {
            setAllBrands(POPULAR_BRANDS_STUB.sort());
        }
    };

    /**
     * @function fetchSearchResults
     * @async
     * @description Wysyla zapytanie do serwera o produkty pasujace do podanej frazy.
     * @param {string} query - Fraza wyszukiwania przekazana do API.
     */
    const fetchSearchResults = async (query) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/panel/Product/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setError('Failed to fetch search results.');
            }
        } catch (err) {
            setError('Connection error occurred.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * @function processedProducts
     * @description Glowny algorytm przetwarzania danych (memoizowany).
     * @details Filtruje i sortuje pobrana liste produktow w pamieci przegladarki na podstawie stanu filtrow.
     * @returns {Array} Przetworzona lista produktow gotowa do wyswietlenia.
     */
    const processedProducts = useMemo(() => {
        let result = [...products];

        // 1. Filtr po cenie
        if (minPrice) result = result.filter(p => p.finalPrice >= parseFloat(minPrice));
        if (maxPrice) result = result.filter(p => p.finalPrice <= parseFloat(maxPrice));

        // 2. Filtr po markach
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brand));
        }

        // 3. Filtr po statusie (Promocja)
        if (onlyPromoted) {
            result = result.filter(p => p.hasActiveDiscount);
        }

        // 4. Logika sortowania
        if (sortOrder === 'price-asc') result.sort((a, b) => a.finalPrice - b.finalPrice);
        if (sortOrder === 'price-desc') result.sort((a, b) => b.finalPrice - a.finalPrice);
        if (sortOrder === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));

        return result;
    }, [products, minPrice, maxPrice, selectedBrands, onlyPromoted, sortOrder]);

    /**
     * @function handleBrandToggle
     * @description Przelacza zaznaczenie danej marki w liscie filtrow producentow.
     * @param {string} brand - Nazwa marki do dodania lub usuniecia z zestawu.
     */
    const handleBrandToggle = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    /**
     * @function resetFilters
     * @description Przywraca wszystkie filtry oraz parametry sortowania do wartosci domyslnych.
     */
    const resetFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedBrands([]);
        setOnlyPromoted(false);
        setSortOrder('default');
    };

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
                    <ArrowLeft size={14} /> Back to homepage
                </Link>
            </nav>

            <div className="row">
                {/* --- SIDEBAR: FILTERS --- */}
                <aside className="col-lg-3 pe-lg-4">
                    <div className="sticky-top" style={{ top: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                                <Filter size={18} /> Filters
                            </h5>
                            {(minPrice || maxPrice || selectedBrands.length > 0 || onlyPromoted) && (
                                <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" onClick={resetFilters}>
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Sekcja statusu (Promocje) */}
                        <div className="card border-0 shadow-sm mb-3 p-3">
                            <label className="fw-bold small text-uppercase text-muted mb-3 d-flex align-items-center gap-2">
                                Status
                            </label>
                            <div className="form-check mb-0">
                                <input
                                    className="form-check-input shadow-none"
                                    type="checkbox"
                                    id="status-promocja"
                                    checked={onlyPromoted}
                                    onChange={(e) => setOnlyPromoted(e.target.checked)}
                                />
                                <label className="form-check-label small cursor-pointer d-flex align-items-center gap-2" htmlFor="status-promocja">
                                    <Tag size={14} className="text-danger" /> Promocja (On Sale)
                                </label>
                            </div>
                        </div>

                        {/* Sekcja zakresu cenowego */}
                        <div className="card border-0 shadow-sm mb-3 p-3">
                            <label className="fw-bold small text-uppercase text-muted mb-3">Price range (zl)</label>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    type="number" className="form-control form-control-sm border-light-subtle"
                                    placeholder="From" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                                />
                                <span className="text-muted">-</span>
                                <input
                                    type="number" className="form-control form-control-sm border-light-subtle"
                                    placeholder="To" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sekcja wyboru producenta */}
                        <div className="card border-0 shadow-sm p-3">
                            <label className="fw-bold small text-uppercase text-muted mb-3">Producer</label>
                            <div className="brand-scroll-box" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                                {allBrands.map(brand => {
                                    const hasResults = products.some(p => p.brand === brand);
                                    return (
                                        <div key={brand} className={`form-check mb-2 ${!hasResults ? 'text-muted' : ''}`}>
                                            <input
                                                className="form-check-input shadow-none"
                                                type="checkbox"
                                                id={`brand-${brand}`}
                                                checked={selectedBrands.includes(brand)}
                                                onChange={() => handleBrandToggle(brand)}
                                            />
                                            <label className="form-check-label small cursor-pointer d-flex justify-content-between align-items-center" htmlFor={`brand-${brand}`}>
                                                {brand}
                                                {hasResults && <Check size={12} className="text-primary" />}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT: PRODUCTS --- */}
                <main className="col-lg-9 mt-4 mt-lg-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 bg-white p-3 rounded shadow-sm gap-3">
                        <div>
                            <h1 className="h4 mb-1 fw-bold">Search results</h1>
                            <p className="text-muted small m-0">
                                Found <strong>{processedProducts.length}</strong> products for <span className="text-primary fw-semibold">"{searchQuery}"</span>
                            </p>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <label className="small text-muted text-nowrap">Sort by:</label>
                            <select
                                className="form-select form-select-sm border-light bg-light fw-semibold"
                                value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                                style={{ width: '190px', cursor: 'pointer' }}
                            >
                                <option value="default">Relevance</option>
                                <option value="price-asc">Cheapest first</option>
                                <option value="price-desc">Most expensive first</option>
                                <option value="name-asc">Name: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

                    {/* Prezentacja listy produktow */}
                    {processedProducts.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                            {processedProducts.map((p) => (
                                <div key={p.id} className="product-row card border-0 shadow-sm overflow-hidden"
                                    onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>

                                    <div className="d-flex flex-column flex-md-row p-3 gap-4">
                                        <div className="d-flex align-items-center justify-content-center bg-light rounded p-2" style={{ width: '160px', height: '160px', minWidth: '160px' }}>
                                            <div className="position-relative">
                                                {p.hasActiveDiscount && (
                                                    <span className="badge bg-danger position-absolute" style={{ top: "-15px", left: "-15px", fontSize: '0.7rem' }}>
                                                        -{p.discountPercentage}%
                                                    </span>
                                                )}
                                                <img
                                                    src={p.imageUrls?.[0] || 'https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png'}
                                                    alt={p.name} className="img-fluid" style={{ maxHeight: '140px', objectFit: 'contain' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-grow-1 d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="fw-bold text-dark mb-1 h-name">{p.name}</h5>
                                                <div className="mb-2">
                                                    <span className="badge bg-light text-dark border me-2" style={{ fontSize: '0.7rem' }}>{p.brand}</span>
                                                    <span className="text-muted small">{p.productCategoryName}</span>
                                                </div>
                                                <p className="text-muted small d-none d-md-block mb-0">
                                                    {p.description?.substring(0, 180)}...
                                                </p>
                                            </div>
                                            <div className="mt-3">
                                                <span className={`small d-flex align-items-center gap-1 ${p.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                                                    <Package size={14} />
                                                    {p.quantity > 0 ? `In stock (${p.quantity} pcs)` : 'Currently unavailable'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-row flex-md-column justify-content-between justify-content-md-center align-items-end border-md-start ps-md-4 text-end" style={{ minWidth: '180px' }}>
                                            <div className="mb-md-4">
                                                {p.hasActiveDiscount ? (
                                                    <>
                                                        <div className="text-decoration-line-through text-muted small">{p.price.toFixed(2)} zł</div>
                                                        <div className="h3 fw-bold text-danger mb-0">{p.finalPrice.toFixed(2)} zł</div>
                                                    </>
                                                ) : (
                                                    <div className="h3 fw-bold text-dark mb-0">{p.price.toFixed(2)} zł</div>
                                                )}
                                            </div>

                                            <div className="d-flex flex-column gap-2 w-100">
                                                <button
                                                    className="btn btn-dark btn-sm w-100 fw-bold buy-btn"
                                                    disabled={p.quantity <= 0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(p);
                                                        navigate("/cart");
                                                    }}
                                                >
                                                    Add to cart
                                                </button>
                                                <Link to={`/product/${p.id}`} className="btn btn-outline-secondary btn-sm w-100" onClick={(e) => e.stopPropagation()}>
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Widok braku wynikow */
                        <div className="text-center py-5 bg-white rounded shadow-sm border mt-4">
                            <Search size={64} className="text-muted opacity-25 mb-4" />
                            <h3 className="h5 fw-bold">No products matched your criteria</h3>
                            <p className="text-muted mb-4">Try checking for typos or adjusting your filters.</p>
                            <button className="btn btn-primary px-4 fw-bold" onClick={resetFilters}>Reset all filters</button>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                .product-row { transition: transform 0.2s, box-shadow 0.2s; border: 1px solid transparent !important; }
                .product-row:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important; border-color: #dee2e6 !important; }
                .product-row:hover .h-name { color: #007bff; }
                .buy-btn:hover { background: #28a745 !important; border-color: #28a745 !important; }
                .brand-scroll-box::-webkit-scrollbar { width: 4px; }
                .brand-scroll-box::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
                .cursor-pointer { cursor: pointer; }
                @media (min-width: 768px) {
                    .border-md-start { border-left: 1px solid #efefef !important; }
                }
            `}</style>
        </div>
    );
}

export default SearchPage;