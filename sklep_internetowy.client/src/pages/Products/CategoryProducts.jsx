import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

function CategoryProducts() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = '/api/ProductCategory';

    const isDiscountActive = (p) => p.hasActiveDiscount && p.finalPrice < p.price;

    useEffect(() => {
        if (slug) {
            fetchCategoryAndProducts();
        } else {
            setLoading(false);
            setError('Category identifier (slug) is missing in the URL.');
        }
    }, [slug]);

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

    const handleAddToCart = (product) => {
        console.log(`Adding ${product.name} to cart.`);
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
                `}
            </style>

            {products.length > 0 && (
                <div className="row g-3">
                    {products.map((p) => (
                        <div key={p.id} className="col-12">
                            <div className="product-list-item d-flex align-items-center bg-white rounded-lg">

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
                                    <Link to={`/products/${p.id}`} className="text-decoration-none">
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
                                        onClick={() => handleAddToCart(p)}
                                    >
                                        {p.quantity > 0 ? "Add to cart" : "Unavailable"}
                                    </button>

                                    <Link to={`/products/${p.id}`} className="btn btn-outline-secondary w-100 btn-sm mt-1">
                                        Details
                                    </Link>
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
