// components/product/ProductForm.jsx
import React, { useState, useEffect } from 'react';

const ProductForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                price: initialData.price.toString(),
                quantity: initialData.quantity.toString(),
                description: initialData.description || ''
            });
        }
    }, [initialData]);

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
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