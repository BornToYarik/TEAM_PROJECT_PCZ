import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Trash2, Package } from 'lucide-react';

/**
 * @file PromotionManagement.jsx
 * @brief Komponent panelu administratora do zarzadzania kampaniami promocyjnymi.
 * @details Umozliwia filtrowanie produktow spelniajacych kryteria promocji (np. stan magazynowy, brak aktywnosci) 
 * oraz masowe nakladanie znizek procentowych na wybrane towary.
 */

/**
 * @component PromotionManagement
 * @description Glowny widok administracyjny do konfiguracji i aktywacji promocji. 
 * Zarzadza procesem wyszukiwania kandydatow, ich selekcji oraz komunikacji z API promocji.
 */
const PromotionManagement = () => {
    /** @brief Obiekt przechowujacy filtry wyszukiwania oraz parametry nowej kampanii promocyjnej. */
    const [settings, setSettings] = useState({
        categoryId: '',
        minStock: 5,
        daysInactive: 30,
        percentage: 15,
        durationDays: 7
    });

    /** @brief Lista kategorii produktow pobrana z serwera dla pola wyboru. */
    const [categories, setCategories] = useState([]);
    /** @brief Lista produktow (kandydatow) spelniajacych kryteria wyszukiwania. */
    const [productList, setProductList] = useState([]);
    /** @brief Flaga informujaca o trwajacym procesie pobierania danych z serwera. */
    const [isLoading, setIsLoading] = useState(false);
    /** @brief Flaga informujaca o trwajacym procesie zapisu promocji lub czyszczenia danych. */
    const [isSaving, setIsSaving] = useState(false);
    /** @brief Obiekt stanu przechowujacy wiadomosc zwrotna i jej typ dla uzytkownika. */
    const [status, setStatus] = useState({ text: '', type: '' });

    /** @brief Podstawowy adres URL do punktu koncowego API promocji. */
    const API_BASE = '/api/panel/Promotion';

    /** * @effect Inicjalizacja komponentu.
     * @description Pobiera liste kategorii przy montowaniu komponentu w celu wypelnienia selecta.
     */
    useEffect(() => {
        fetch('/api/ProductCategory')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Error loading categories", err));
    }, []);

    /**
     * @function findProducts
     * @async
     * @description Pobiera z serwera liste produktow kwalifikujacych sie do promocji na podstawie ustawionych filtrow.
     */
    const findProducts = async () => {
        setIsLoading(true);
        setStatus({ text: '', type: '' });

        const params = new URLSearchParams({
            categoryId: settings.categoryId,
            minStock: settings.minStock,
            daysInactive: settings.daysInactive
        }).toString();

        try {
            const response = await fetch(`${API_BASE}/candidates?${params}`);
            if (response.ok) {
                const data = await response.json();
                setProductList(data);
                if (data.length === 0) {
                    setStatus({ text: 'No products found', type: 'info' });
                }
            } else {
                setStatus({ text: 'Server error', type: 'error' });
            }
        } catch (err) {
            setStatus({ text: 'Connection error', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @function excludeProduct
     * @description Usuwa wskazany produkt z lokalnej listy kandydatow przed nalozeniem promocji.
     * @param {number|string} id - Identyfikator produktu do usuniecia z listy.
     */
    const excludeProduct = (id) => {
        setProductList(productList.filter(item => item.id !== id));
    };

    /**
     * @function launchPromotion
     * @async
     * @description Przesyla liste identyfikatorow produktow oraz parametry znizki do API w celu uruchomienia promocji.
     */
    const launchPromotion = async () => {
        if (productList.length === 0) return;

        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE}/apply-selected`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productIds: productList.map(p => p.id),
                    percentage: parseInt(settings.percentage),
                    durationDays: parseInt(settings.durationDays)
                })
            });

            if (response.ok) {
                const result = await response.json();
                setStatus({ text: result.message, type: 'success' });
                setProductList([]);
            } else {
                setStatus({ text: 'Failed to apply promotion', type: 'error' });
            }
        } catch (err) {
            setStatus({ text: 'Connection error', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * @function runCleanup
     * @async
     * @description Wywoluje na serwerze akcje czyszczenia wygaslych promocji.
     */
    const runCleanup = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE}/remove-expired`, { method: 'POST' });
            if (response.ok) {
                const result = await response.json();
                setStatus({ text: result.message, type: 'success' });
            }
        } catch (err) {
            setStatus({ text: 'Cleanup failed', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="container">
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h1 className="h3 mb-0">Promotion Management</h1>
                            <button
                                onClick={runCleanup}
                                disabled={isSaving}
                                className="btn btn-secondary"
                            >
                                Remove Expired
                            </button>
                        </div>

                        {status.text && (
                            <div className={`alert ${status.type === 'success' ? 'alert-success' :
                                status.type === 'error' ? 'alert-danger' :
                                    'alert-info'
                                }`} role="alert">
                                {status.text}
                            </div>
                        )}

                        <div className="row g-4">
                            <div className="col-lg-4">
                                <div className="card mb-3">
                                    <div className="card-header">
                                        <h5 className="mb-0 d-flex align-items-center gap-2">
                                            <Search size={18} /> Search Products
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Category</label>
                                            <select
                                                className="form-select"
                                                value={settings.categoryId}
                                                onChange={e => setSettings({ ...settings, categoryId: e.target.value })}
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <label className="form-label">Min. Stock</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={settings.minStock}
                                                    onChange={e => setSettings({ ...settings, minStock: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label">Days Inactive</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={settings.daysInactive}
                                                    onChange={e => setSettings({ ...settings, daysInactive: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={findProducts}
                                            disabled={isLoading}
                                            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <RefreshCw className="spinner-border spinner-border-sm" size={16} />
                                                    Searching...
                                                </>
                                            ) : 'Search'}
                                        </button>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">Promotion Configuration</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Discount: {settings.percentage}%</label>
                                            <input
                                                type="range"
                                                className="form-range"
                                                min="5" max="90" step="5"
                                                value={settings.percentage}
                                                onChange={e => setSettings({ ...settings, percentage: e.target.value })}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Duration (days)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={settings.durationDays}
                                                onChange={e => setSettings({ ...settings, durationDays: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            onClick={launchPromotion}
                                            disabled={productList.length === 0 || isSaving}
                                            className="btn btn-success w-100"
                                        >
                                            {isSaving ? 'Saving...' : `Apply (${productList.length})`}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-8">
                                <div className="card">
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                        <span className="fw-bold d-flex align-items-center gap-2">
                                            <Package size={18} /> Selected Products
                                        </span>
                                        <span className="badge bg-secondary">
                                            {productList.length} items
                                        </span>
                                    </div>

                                    <div className="card-body p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {productList.length > 0 ? (
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Category</th>
                                                        <th className="text-center">Stock</th>
                                                        <th>Price</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productList.map(p => (
                                                        <tr key={p.id}>
                                                            <td>
                                                                <div className="fw-semibold">{p.name}</div>
                                                                <small className="text-muted">ID: {p.id}</small>
                                                            </td>
                                                            <td><small>{p.productCategoryName}</small></td>
                                                            <td className="text-center">
                                                                <span className={p.quantity < 10 ? 'text-danger fw-bold' : ''}>
                                                                    {p.quantity}
                                                                </span>
                                                            </td>
                                                            <td>{p.price.toFixed(2)} zl</td>
                                                            <td className="text-end">
                                                                <button
                                                                    onClick={() => excludeProduct(p.id)}
                                                                    className="btn btn-sm btn-link text-muted p-0"
                                                                    title="Remove"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                <Package size={48} className="mb-3" style={{ opacity: 0.3 }} />
                                                <p className="mb-1">No products selected</p>
                                                <small>Use the filters to search for products</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionManagement;