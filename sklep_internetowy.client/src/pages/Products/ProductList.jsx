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
                // UPDATE - используем JSON
                const payload = {
                    id: editingProduct.id,
                    name: formData.name,
                    brand: formData.brand,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity),
                    description: formData.description || "",
                    productCategoryId: formData.productCategoryId, // ← исправлено
                    discountPercentage: formData.discountPercentage || 0,
                    discountStartDate: formData.discountStartDate || null,
                    discountEndDate: formData.discountEndDate || null
                };

                const response = await fetch(`${API_URL}/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok || response.status === 204) {
                    await fetchProducts();
                    handleCloseForm();
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Error updating product');
                }

            } else {
                // CREATE - используем FormData
                const data = new FormData();

                data.append('Name', formData.name);
                data.append('Brand', formData.brand);
                data.append('Price', formData.price.toString());
                data.append('Quantity', formData.quantity.toString());
                data.append('ProductCategoryId', formData.productCategoryId.toString()); // ← исправлено

                if (formData.description) {
                    data.append('Description', formData.description);
                }

                if (formData.discountPercentage && formData.discountPercentage > 0) {
                    data.append('DiscountPercentage', formData.discountPercentage.toString());
                }

                if (formData.discountStartDate) {
                    data.append('DiscountStartDate', formData.discountStartDate);
                }

                if (formData.discountEndDate) {
                    data.append('DiscountEndDate', formData.discountEndDate);
                }

                if (files && files.length > 0) {
                    files.forEach(file => {
                        data.append('Images', file);
                    });
                }

                console.log('Sending FormData with:');
                for (let pair of data.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: data
                    // НЕ добавляй Content-Type - браузер сам добавит с boundary!
                });

                if (response.ok) {
                    await fetchProducts();
                    handleCloseForm();
                } else {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    setError(errorData.title || errorData.message || JSON.stringify(errorData.errors || 'Error creating product'));
                }
            }
        } catch (err) {
            console.error('Exception:', err);
            setError('Server connection error: ' + err.message);
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

            if (response.ok || response.status === 204) {
                await fetchProducts();
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