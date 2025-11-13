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

    const API_URL = 'https://localhost:60788/api';

    useEffect(() => {
        fetchCategoryAndProducts();
    }, [slug]);

    const fetchCategoryAndProducts = async () => {
        setLoading(true);
        setError('');

        try {
            const categoryResponse = await fetch(`${API_URL}/Category/${slug}`);
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                setCategory(categoryData);
            }

            const productsResponse = await fetch(`${API_URL}/Category/${slug}/products`);
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } else {
                setError('Error loading products');
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
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

            {products.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <p>No products available in this category</p>
                </div>
            ) : (
                <div className="row g-4">
                    {products.map(product => (
                        <div key={product.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    {product.description && (
                                        <p className="card-text text-muted small">{product.description}</p>
                                    )}
                                </div>
                                <div className="card-footer bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="h5 mb-0 text-primary">${product.price.toFixed(2)}</span>
                                        <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                                            {product.quantity > 0 ? `${product.quantity} pcs` : 'Out of stock'}
                                        </span>
                                    </div>
                                    <Link to={`/products/${product.id}`} className="btn btn-outline-primary w-100">
                                        Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CategoryProducts;