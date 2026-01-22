import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCart } from "../../context/CartContext";

/**
 * @file SearchPage.jsx
 * @brief Komponent wyswietlajacy produkty przypisane do konkretnej kategorii (slug).
 * @details Modul odpowiada za pobieranie metadanych kategorii oraz powiazanych z nia produktow, 
 * umozliwiajac ich przegladanie w formie listy oraz dodawanie do koszyka.
 */

/**
 * @component CategoryProducts
 * @description Renderuje widok kategorii produktow. Zarzadza stanem ladowania, 
 * bledami polaczenia oraz logika wyswietlania produktow w ukladzie wierszowym.
 */
function CategoryProducts() {
    /** @brief Pobranie unikalnego identyfikatora kategorii (slug) z adresu URL. */
    const { slug } = useParams();
    /** @brief Stan przechowujacy liste produktow danej kategorii. */
    const [products, setProducts] = useState([]);
    /** @brief Dane o aktualnie przegladanej kategorii. */
    const [category, setCategory] = useState(null);
    /** @brief Flaga okreslajaca status ladowania danych z API. */
    const [loading, setLoading] = useState(true);
    /** @brief Komunikat bledu w przypadku niepowodzenia pobierania danych. */
    const [error, setError] = useState('');

    const { addToCart } = useCart();
    const navigate = useNavigate();

    /** @brief Bazowy adres URL dla punktu koncowego kategorii produktow. */
    const API_URL = '/api/ProductCategory';
    /** @brief Adres domyslnego obrazka uzywanego w przypadku braku grafik produktu. */
    const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png";

    /**
     * @function isDiscountActive
     * @description Sprawdza, czy dany produkt posiada aktywna promocje cenowa.
     * @param {Object} p - Obiekt produktu.
     * @returns {Boolean} True, jesli produkt ma aktywny rabat.
     */
    const isDiscountActive = (p) => p.hasActiveDiscount && p.finalPrice < p.price;

    /**
     * @effect Inicjalizacja komponentu.
     * @description Wywoluje pobieranie danych kategorii i produktow przy kazdej zmianie sluga w URL.
     */
    useEffect(() => {
        if (slug) {
            fetchCategoryAndProducts();
        } else {
            setLoading(false);
            setError('Category identifier (slug) is missing in the URL.');
        }
    }, [slug]);

    /**
     * @function fetchCategoryAndProducts
     * @async
     * @description Pobiera dane o kategorii oraz liste przypisanych do niej produktow z serwera.
     */
    const fetchCategoryAndProducts = async () => {
        setLoading(true);
        setError('');

        try {
            const categoryResponse = await fetch(`${API_URL}/${slug}`);

            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                setCategory(categoryData);
            } else {
                setCategory(null);
                setError(`Category "${slug}" not found.`);
            }

            const productsResponse = await fetch(`${API_URL}/${slug}/products`);

            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } else {
                const productsError = await productsResponse.json();
                if (productsResponse.status !== 404) {
                    setError(productsError.message || `Error loading products for category ${slug}`);
                }
                setProducts([]);
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * @function handleProductClick
     * @description Przekierowuje uzytkownika do strony szczegolow wybranego produktu.
     * @param {number|string} id - Identyfikator produktu.
     */
    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <Link to="/" className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
                <ArrowLeft size={18} />
                Back to Home
            </Link>

            {category && (
                <div className="mb-4">
                    <h1>{category.name}</h1>
                    {category.description && (
                        <p className="text-muted">{category.description}</p>
                    )}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {/* @section Styles
                Lokalne style dla elementow listy produktow.
            */}
            <style>
                {`
                .product-list-item {
                    transition: box-shadow 0.3s ease;
                    border: 1px solid #e0e0e0;
                    margin-bottom: 15px;
                    padding: 15px;
                }

                .product-list-item:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .product-list-img {
                    width: 120px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .buy-btn {
                    transition: background 0.3s ease, color 0.3s ease;
                    background: black;
                    color: white;
                }

                .buy-btn:hover {
                    background: #28a745 !important;
                    color: white;
                }
                .cursor-pointer { cursor: pointer; }
                `}
            </style>

            {products.length > 0 && (
                <div className="row g-3">
                    {products.map((p) => (

                        <div key={p.id} className="col-12"
                            onClick={() => handleProductClick(p.id)}>
                            <div className="product-list-item d-flex align-items-center bg-white rounded-lg cursor-pointer"
                            >

                                <div className="position-relative me-4">
                                    {isDiscountActive(p) && (
                                        <span
                                            className="badge bg-danger position-absolute"
                                            style={{ top: "-8px", right: "-8px" }}
                                        >
                                            -{p.discountPercentage}%
                                        </span>
                                    )}
                                    <img
                                        src={(p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls[0] : DEFAULT_IMAGE}
                                        className="product-list-img"
                                        alt={p.name}
                                    />{console.log(p.imageUrls)}
                                </div>

                                <div className="flex-grow-1 me-4">
                                    <Link to={`/products/${p.id}`} className="text-decoration-none">
                                        <h5 className="card-title text-dark mb-1">{p.name}</h5>
                                    </Link>
                                    <p className="text-muted small mb-1">
                                        Category: <strong>{p.productCategoryName || "None"}
                                        </strong>
                                    </p>
                                    <p className="text-muted small mb-0 d-none d-md-block">
                                        {p.description?.substring(0, 150) + (p.description?.length > 150 ? '...' : '') || "No description"}
                                    </p>
                                </div>

                                <div className="d-flex flex-column align-items-end text-end" style={{ width: '150px' }}>

                                    {isDiscountActive(p) ? (
                                        <div className="mb-2">
                                            <p className="text-decoration-line-through text-muted mb-0 small">
                                                {p.price.toFixed(2)} zł
                                            </p>
                                            <p className="fw-bold text-danger fs-5 mb-0">
                                                {p.finalPrice.toFixed(2)} zł
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="fw-bold text-success fs-5 mb-2">
                                            {p.price.toFixed(2)} zł
                                        </p>
                                    )}

                                    <p
                                        className={`mb-2 small ${p.quantity > 0 ? "text-success" : "text-danger"}`}
                                    >
                                        {p.quantity > 0 ? `In stock: ${p.quantity}` : "Out of stock"}
                                    </p>

                                    <button
                                        className="btn w-100 buy-btn btn-sm"
                                        disabled={p.quantity <= 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(p)
                                            navigate("/cart");
                                        }}
                                    >
                                        {p.quantity > 0 ? "Add to cart" : "Unavailable"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {products.length === 0 && category && (
                <div className="text-center text-muted py-5">
                    <p>No products available in the "{category.name}" category.</p>
                </div>
            )}

        </div>
    );
}

export default CategoryProducts;