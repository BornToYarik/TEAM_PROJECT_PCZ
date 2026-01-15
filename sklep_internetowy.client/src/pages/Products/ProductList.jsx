import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProductCard from '../../components/admin/product/ProductCard';
import ProductForm from '../../components/admin/product/ProductForm';
import 'bootstrap/dist/css/bootstrap.min.css';

function ProductsList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const API_URL = '/api/panel/Product';

    useEffect(() => {
        fetchProducts();
    }, []);

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

    const handleFormSubmit = async (formData, files) => {
        setError('');

        try {
            if (editingProduct) {
                // ЛОГИКА ОБНОВЛЕНИЯ (PUT)
                const payload = {
                    name: formData.name,
                    brand: formData.brand, // <-- ДОБАВЛЕНО ТУТ
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
                // ЛОГИКА СОЗДАНИЯ (POST)
                const data = new FormData();

                data.append('Name', formData.name);
                data.append('Brand', formData.brand); // <-- ДОБАВЛЕНО ТУТ (с большой буквы для соответствия DTO)
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
                    // Если сервер вернул 400 с текстом ошибок, выводим их
                    setError(errorData.title || errorData.message || 'Error creating product');
                }
            }
        } catch (err) {
            setError('Server connection error');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

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