import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCart } from "../../../context/CartContext";

function SearchPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const API_URL = '/api/panel/Product/search';

    const isDiscountActive = (p) => p.hasActiveDiscount && p.finalPrice < p.price;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        setSearchQuery(query);

        if (query) {
            fetchSearchResults(query);
        } else {
            setProducts([]);
        }
    }, [location.search]);

    const fetchSearchResults = async (query) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error fetching search results.');
            }
        } catch (err) {
            setError('Server connection error during search.');
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (id) => {
        navigate(`/products/${id}`);
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

    const displayQuery = searchQuery.length > 30 ? searchQuery.substring(0, 30) + '...' : searchQuery;

    return (
        <div className="container mt-5 mb-5">
            <Link to="/" className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
                <ArrowLeft size={18} />
                Back to Home
            </Link>

            <h1 className="mb-4 d-flex align-items-center gap-2">
                <Search size={32} /> Search Results
            </h1>

            {searchQuery && (
                <p className="lead text-primary">
                    Showing results for: <strong>"{displayQuery}"</strong>
                </p>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

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

            {products.length > 0 ? (
                <div className="row g-3 mt-4">
                    {products.map((p) => (
                        <div key={p.id} className="col-12"
                            onClick={() => handleProductClick(p.id)}>
                            <div
                                className="product-list-item d-flex align-items-center bg-white rounded-lg cursor-pointer"
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
                                        src="https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png"
                                        className="product-list-img"
                                        alt={p.name}
                                    />
                                </div>

                                <div className="flex-grow-1 me-4">
                                    <Link to={`/products/${p.id}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
                                        <h5 className="card-title text-dark mb-1">{p.name}</h5>
                                    </Link>
                                    <p className="text-muted small mb-1">
                                        Category: <strong>{p.productCategoryName || "None"}</strong>
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
                                            addToCart(p);
                                            navigate("/cart");
                                        }}
                                    >
                                        {p.quantity > 0 ? "Add to cart" : "Unavailable"}
                                    </button>

                                    <Link
                                        to={`/product/${p.id}`}
                                        className="btn btn-outline-secondary w-100 btn-sm mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : searchQuery && products.length === 0 && !loading ? (
                <div className="text-center text-muted py-5">
                    <p>No products matched your search criteria.</p>
                </div>
            ) : (
                <div className="text-center text-muted py-5">
                    <p>Enter a product name or description to start searching.</p>
                </div>
            )}

        </div>
    );
}

export default SearchPage;