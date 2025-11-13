import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import ProductForm from '../../components/admin/product/ProductForm';
import 'bootstrap/dist/css/bootstrap.min.css';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const API_URL = '/api/panel/Product';
    //test

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
            } else if (response.status === 404) {
                setError('Product not found');
            } else {
                setError('Error loading product');
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        setError('');
        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            description: formData.description || null
        };

        try {
            const response = await fetch(`${API_URL}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(id), ...payload })
            });

            if (response.ok) {
                fetchProduct();
                setShowForm(false);
            } else {
                setError('Error updating product');
            }
        } catch (err) {
            setError('Server connection error');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setError('');
            try {
                const response = await fetch(`${API_URL}/remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: parseInt(id) })
                });

                if (response.ok) {
                    navigate('/products');
                } else {
                    setError('Error deleting product');
                }
            } catch (err) {
                setError('Server connection error');
            }
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

    if (error && !product) {
        return (
            <div className="container mt-5">
                <Link to="/products" className="btn btn-outline-secondary mb-3 d-flex align-items-center gap-2 w-fit">
                    <ArrowLeft size={18} />
                    Back to Products
                </Link>
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <Link to="/products" className="btn btn-outline-secondary mb-3 d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
                <ArrowLeft size={18} />
                Back to Products
            </Link>

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

            {showForm ? (
                <ProductForm
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                    initialData={product}
                    isEditing={true}
                />
            ) : (
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <h1 className="card-title mb-2">{product.name}</h1>
                                        <p className="text-muted">{product.description || 'No description'}</p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => setShowForm(true)}
                                        >
                                            <Edit size={18} className="me-1" />
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={handleDelete}
                                        >
                                            <Trash2 size={18} className="me-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="row mt-4">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Price</label>
                                            <h3 className="text-primary">${product.price.toFixed(2)}</h3>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Stock</label>
                                            <div>
                                                <span className={`badge fs-6 ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                    {product.quantity > 0 ? `${product.quantity} pcs` : 'Out of stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="form-label text-muted">Product ID</label>
                                    <p className="form-control-plaintext">{product.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetails;