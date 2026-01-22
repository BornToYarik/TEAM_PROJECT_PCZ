import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProductCard from '../../components/admin/product/ProductCard';
import ProductForm from '../../components/admin/product/ProductForm';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * @file ProductsList.jsx
 * @brief Komponent zarzadzajacy wyswietlaniem i operacjami na liscie produktow w panelu administratora.
 * @details Modul odpowiada za pobieranie danych z API, ladowanie listy produktow, 
 * przelaczanie widoku formularza (tworzenie/edycja) oraz obsluge usuwania rekordow.
 */

/**
 * @component ProductsList
 * @description Glowny komponent widoku listy produktow. Zarzadza stanem kolekcji, 
 * ladowaniem danych oraz komunikatami o bledach.
 */
function ProductsList() {
    /** @brief Tablica przechowujaca produkty pobrane z bazy danych. */
    const [products, setProducts] = useState([]);
    /** @brief Flaga okreslajaca, czy trwa proces pobierania danych z serwera. */
    const [loading, setLoading] = useState(false);
    /** @brief Przechowuje tresc komunikatow o bledach operacji API. */
    const [error, setError] = useState('');
    /** @brief Flaga kontrolujaca widocznosc formularza ProductForm. */
    const [showForm, setShowForm] = useState(false);
    /** @brief Obiekt produktu wybranego do edycji (null w trybie dodawania nowego). */
    const [editingProduct, setEditingProduct] = useState(null);

    /** @brief Bazowy adres URL dla punktu koncowego API produktow. */
    const API_URL = '/api/panel/Product';

    /**
     * @effect Inicjalizacja komponentu.
     * @description Pobiera liste produktow przy pierwszym renderowaniu strony.
     */
    useEffect(() => {
        fetchProducts();
    }, []);

    /**
     * @function fetchProducts
     * @async
     * @description Pobiera aktualna liste wszystkich produktow z serwera.
     */
    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setError('Error loading products');
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * @function handleFormSubmit
     * @async
     * @description Obsluguje wysylanie danych z formularza (tworzenie lub aktualizacja).
     * @details Jesli editingProduct istnieje, wykonuje PUT (JSON). W przeciwnym razie 
     * wykonuje POST przy uzyciu FormData (obsluga plikow).
     * @param {Object} formData - Dane tekstowe produktu.
     * @param {Array} files - Opcjonalna lista plikow graficznych.
     */
    const handleFormSubmit = async (formData, files) => {
        setError('');

        try {
            if (editingProduct) {
                // --- TRYB EDYCJI ---
                const payload = {
                    name: formData.name,
                    brand: formData.brand,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity),
                    description: formData.description || null,
                    ProductCategoryId: formData.ProductCategoryId,
                    DiscountPercentage: formData.DiscountPercentage,
                    DiscountStartDate: formData.DiscountStartDate,
                    DiscountEndDate: formData.DiscountEndDate
                };

                const response = await fetch(`${API_URL}/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingProduct.id, ...payload })
                });

                if (response.ok) {
                    fetchProducts();
                    handleCloseForm();
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Error updating product');
                }

            } else {
                // --- TRYB TWORZENIA ---
                const data = new FormData();

                data.append('Name', formData.name);
                data.append('Brand', formData.brand);
                data.append('Price', formData.price);
                data.append('Quantity', formData.quantity);
                data.append('Description', formData.description || '');
                data.append('ProductCategoryId', formData.ProductCategoryId);

                if (formData.DiscountPercentage) data.append('DiscountPercentage', formData.DiscountPercentage);
                if (formData.DiscountStartDate) data.append('DiscountStartDate', formData.DiscountStartDate);
                if (formData.DiscountEndDate) data.append('DiscountEndDate', formData.DiscountEndDate);

                if (files && files.length > 0) {
                    files.forEach(file => {
                        data.append('Images', file);
                    });
                }

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: data
                });

                if (response.ok) {
                    fetchProducts();
                    handleCloseForm();
                } else {
                    const errorData = await response.json();
                    setError(errorData.title || errorData.message || 'Error creating product');
                }
            }
        } catch (err) {
            setError('Server connection error');
        }
    };

    /**
     * @function handleEdit
     * @description Przelacza komponent w tryb edycji wskazanego produktu.
     * @param {Object} product - Obiekt produktu do edycji.
     */
    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    /**
     * @function handleDelete
     * @async
     * @description Usuwa produkt z bazy danych po potwierdzeniu przez uzytkownika.
     * @param {number|string} id - Identyfikator produktu.
     */
    const handleDelete = async (id) => {
        setError('');
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                fetchProducts();
            } else {
                setError('Error deleting product');
            }
        } catch (err) {
            setError('Server connection error');
        }
    };

    /**
     * @function handleCloseForm
     * @description Zamyka formularz i resetuje stan edycji.
     */
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Products</h1>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => { setShowForm(true); setEditingProduct(null); }}
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            {/* Powiadomienia o bledach */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError('')}
                    ></button>
                </div>
            )}

            {/* Formularz produktu */}
            {showForm && (
                <div className="mb-4">
                    <ProductForm
                        onSubmit={handleFormSubmit}
                        onCancel={handleCloseForm}
                        initialData={editingProduct}
                        isEditing={!!editingProduct}
                    />
                </div>
            )}

            {/* Lista produktow / Spinner */}
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {products.length === 0 ? (
                        <div className="col-12">
                            <div className="text-center text-muted py-5">
                                No products available
                            </div>
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product.id} className="col-md-6 col-lg-4">
                                <ProductCard
                                    product={product}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default ProductsList;