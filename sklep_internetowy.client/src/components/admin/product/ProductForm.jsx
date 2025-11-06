import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

function ProductForm({ onSubmit, onCancel, initialData, isEditing }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        description: '',
        discountPercentage: '',
        discountStartDate: '',
        discountEndDate: ''
    });

    const [showDiscountFields, setShowDiscountFields] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                price: initialData.price || '',
                quantity: initialData.quantity || '',
                description: initialData.description || '',
                discountPercentage: initialData.discountPercentage || '',
                discountStartDate: initialData.discountStartDate
                    ? new Date(initialData.discountStartDate).toISOString().slice(0, 16)
                    : '',
                discountEndDate: initialData.discountEndDate
                    ? new Date(initialData.discountEndDate).toISOString().slice(0, 16)
                    : ''
            });
            setShowDiscountFields(!!initialData.discountPercentage);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const submitData = {
            ...formData,
            discountPercentage: showDiscountFields && formData.discountPercentage
                ? parseFloat(formData.discountPercentage)
                : null,
            discountStartDate: showDiscountFields && formData.discountStartDate
                ? new Date(formData.discountStartDate).toISOString()
                : null,
            discountEndDate: showDiscountFields && formData.discountEndDate
                ? new Date(formData.discountEndDate).toISOString()
                : null
        };

        onSubmit(submitData);
    };

    const handleToggleDiscount = () => {
        setShowDiscountFields(!showDiscountFields);
        if (showDiscountFields) {
            setFormData(prev => ({
                ...prev,
                discountPercentage: '',
                discountStartDate: '',
                discountEndDate: ''
            }));
        }
    };

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    {isEditing ? 'Edit product' : 'Add new product'}
                </h5>
                <button
                    type="button"
                    className="btn btn-sm btn-link text-secondary"
                    onClick={onCancel}
                >
                    <X size={20} />
                </button>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Product name *</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3 mb-3">
                            <label className="form-label">Price (PLN) *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3 mb-3">
                            <label className="form-label">Quantity *</label>
                            <input
                                type="number"
                                className="form-control"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="discountToggle"
                                checked={showDiscountFields}
                                onChange={handleToggleDiscount}
                            />
                            <label className="form-check-label d-flex align-items-center gap-2" htmlFor="discountToggle">
                                <Tag size={18} />
                                <strong>Add promotion</strong>
                            </label>
                        </div>
                    </div>

                    {showDiscountFields && (
                        <div className="border border-danger rounded p-3 mb-3 bg-light">
                            <h6 className="text-danger mb-3">
                                <Tag size={18} className="me-2" />
                                Promotion settings
                            </h6>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Discount (%) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        className="form-control"
                                        name="discountPercentage"
                                        value={formData.discountPercentage}
                                        onChange={handleChange}
                                        required={showDiscountFields}
                                    />
                                    <small className="text-muted">Value from 0 to 100</small>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Start date</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        name="discountStartDate"
                                        value={formData.discountStartDate}
                                        onChange={handleChange}
                                    />
                                    <small className="text-muted">Optional</small>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label className="form-label">End date</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        name="discountEndDate"
                                        value={formData.discountEndDate}
                                        onChange={handleChange}
                                    />
                                    <small className="text-muted">Optional</small>
                                </div>
                            </div>

                            {formData.price && formData.discountPercentage && (
                                <div className="alert alert-success mb-0">
                                    <strong>Preview:</strong>
                                    <div className="d-flex gap-3 mt-2">
                                        <span className="text-decoration-line-through">
                                            Price: {parseFloat(formData.price).toFixed(2)} PLN
                                        </span>
                                        <span className="text-danger fw-bold">
                                            After discount: {(parseFloat(formData.price) * (1 - parseFloat(formData.discountPercentage) / 100)).toFixed(2)} PLN
                                        </span>
                                        <span className="text-success">
                                            You save: {(parseFloat(formData.price) * parseFloat(formData.discountPercentage) / 100).toFixed(2)} PLN
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="d-flex gap-2 justify-content-end">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {isEditing ? 'Update product' : 'Add product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductForm;