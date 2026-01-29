import React, { useState, useEffect } from 'react';

const ProductForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        quantity: '',
        description: '',
        categoryId: '',
        discountPercentage: '',
        discountStartDate: '',
        discountEndDate: ''
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            const formatDate = (dateString) => {
                if (!dateString) return '';
                return new Date(dateString).toISOString().substring(0, 10);
            };

            setFormData({
                name: initialData.name || '',
                brand: initialData.brand || '',
                price: initialData.price?.toString() || '',
                quantity: initialData.quantity?.toString() || '',
                description: initialData.description || '',
                categoryId: (initialData.productCategoryId || initialData.ProductCategoryId || initialData.categoryId || '').toString(),
                discountPercentage: initialData.discountPercentage?.toString() || '',
                discountStartDate: formatDate(initialData.discountStartDate),
                discountEndDate: formatDate(initialData.discountEndDate)
            });
        }
    }, [initialData]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/ProductCategory`);
            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data) ? data : (data.$values || []);
                setCategories(list);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
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

        if (!formData.brand.trim()) {
            newErrors.brand = 'Brand is required';
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

        const catId = parseInt(formData.categoryId, 10);
        if (!formData.categoryId || isNaN(catId) || catId <= 0) {
            newErrors.categoryId = 'Category is required';
        }

        const discPercent = parseFloat(formData.discountPercentage);
        if (formData.discountPercentage && (isNaN(discPercent) || discPercent < 0 || discPercent > 100)) {
            newErrors.discountPercentage = 'Discount must be between 0 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const categoryIdInt = parseInt(formData.categoryId, 10);

            const dataToSend = {
                id: initialData?.id || 0,
                name: formData.name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity, 10),
                description: formData.description || "",
                productCategoryId: categoryIdInt,
                discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : 0,
                discountStartDate: formData.discountStartDate || null,
                discountEndDate: formData.discountEndDate || null,
            };

            onSubmit(dataToSend, selectedFiles);
        }
    };

    return (
        <div className="card mb-4 bg-dark text-white border-secondary">
            <div className="card-body">
                <h5 className="card-title mb-4">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h5>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small">Product Name *</label>
                            <input
                                type="text"
                                className={`form-control bg-dark text-white border-secondary ${errors.name ? 'is-invalid' : ''}`}
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                            {errors.name && (
                                <div className="invalid-feedback d-block">{errors.name}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label small">Brand *</label>
                            <input
                                type="text"
                                className={`form-control bg-dark text-white border-secondary ${errors.brand ? 'is-invalid' : ''}`}
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                placeholder="e.g. Apple, Samsung"
                            />
                            {errors.brand && (
                                <div className="invalid-feedback d-block">{errors.brand}</div>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small">Category *</label>
                        <select
                            className={`form-select bg-dark text-white border-secondary ${errors.categoryId ? 'is-invalid' : ''}`}
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

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small">Price *</label>
                            <input
                                type="number"
                                className={`form-control bg-dark text-white border-secondary ${errors.price ? 'is-invalid' : ''}`}
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
                        <div className="col-md-6 mb-3">
                            <label className="form-label small">Quantity *</label>
                            <input
                                type="number"
                                className={`form-control bg-dark text-white border-secondary ${errors.quantity ? 'is-invalid' : ''}`}
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="0"
                            />
                            {errors.quantity && (
                                <div className="invalid-feedback d-block">{errors.quantity}</div>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small">Discount Percentage (%)</label>
                        <input
                            type="number"
                            className={`form-control bg-dark text-white border-secondary ${errors.discountPercentage ? 'is-invalid' : ''}`}
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            max="100"
                        />
                        {errors.discountPercentage && (
                            <div className="invalid-feedback d-block">{errors.discountPercentage}</div>
                        )}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small">Discount Start Date</label>
                            <input
                                type="date"
                                className="form-control bg-dark text-white border-secondary"
                                name="discountStartDate"
                                value={formData.discountStartDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label small">Discount End Date</label>
                            <input
                                type="date"
                                className="form-control bg-dark text-white border-secondary"
                                name="discountEndDate"
                                value={formData.discountEndDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small">Description</label>
                        <textarea
                            className="form-control bg-dark text-white border-secondary"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small">Product Images</label>
                        <input
                            type="file"
                            className="form-control bg-dark text-white border-secondary"
                            multiple
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-success px-4 fw-bold">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={onCancel} className="btn btn-secondary px-4">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;