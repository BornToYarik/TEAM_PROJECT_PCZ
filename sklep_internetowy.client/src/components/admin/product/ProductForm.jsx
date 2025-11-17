// components/product/ProductForm.jsx
import React, { useState, useEffect } from 'react';

const ProductForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        description: '',
        categoryId: ''
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    const API_URL = '/api/panel/Product';

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                price: initialData.price.toString(),
                quantity: initialData.quantity.toString(),
                description: initialData.description || '',
                categoryId: initialData.categoryId.toString()
            });
        }
    }, [initialData]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/Category`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (formData.quantity === '') {
            newErrors.quantity = 'Quantity is required';
        } else if (parseInt(formData.quantity) < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit({
                ...formData,
                categoryId: parseInt(formData.categoryId)
            });
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h5>
                <div>
                    <div className="mb-3">
                        <label className="form-label">Product Name *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        {errors.name && (
                            <div className="invalid-feedback d-block">{errors.name}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Category *</label>
                        <select
                            className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <div className="invalid-feedback d-block">{errors.categoryId}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Price *</label>
                        <input
                            type="number"
                            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                        />
                        {errors.price && (
                            <div className="invalid-feedback d-block">{errors.price}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Quantity *</label>
                        <input
                            type="number"
                            className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            min="0"
                        />
                        {errors.quantity && (
                            <div className="invalid-feedback d-block">{errors.quantity}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="d-flex gap-2">
                        <button onClick={handleSubmit} className="btn btn-success">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                        <button onClick={onCancel} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;