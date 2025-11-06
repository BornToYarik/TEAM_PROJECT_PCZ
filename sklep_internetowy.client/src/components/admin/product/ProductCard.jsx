import { Link } from 'react-router-dom';
import { Trash2, Edit, Tag, Clock } from 'lucide-react';

function ProductCard({ product, onEdit, onDelete }) {
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            onDelete(product.id);
        }
    };

    const calculateDaysLeft = () => {
        if (!product.discountEndDate) return null;
        const end = new Date(product.discountEndDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysLeft = product.hasActiveDiscount ? calculateDaysLeft() : null;

    return (
        <div className={`card h-100 shadow-sm position-relative ${product.hasActiveDiscount ? 'border-danger border-2' : ''}`}>
            {product.hasActiveDiscount && (
                <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-danger fs-6 d-flex align-items-center gap-1">
                        <Tag size={16} />
                        -{product.discountPercentage}%
                    </span>
                </div>
            )}

            <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
                <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEdit(product)}
                    title="Edit product"
                >
                    <Edit size={16} />
                </button>
                <button
                    className="btn btn-sm btn-danger"
                    onClick={handleDelete}
                    title="Delete product"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="card-body pt-5">
                <h5 className="card-title">{product.name}</h5>
                {product.description && (
                    <p className="card-text text-muted small">{product.description}</p>
                )}

                {product.hasActiveDiscount && daysLeft !== null && (
                    <div className="alert alert-warning py-2 px-3 mt-2 mb-0 d-flex align-items-center gap-2">
                        <Clock size={16} />
                        <small>
                            {daysLeft === 0 ? (
                                <strong>Last day of promotion!</strong>
                            ) : daysLeft === 1 ? (
                                <span><strong>1 day</strong> left</span>
                            ) : (
                                <span><strong>{daysLeft} days</strong> left</span>
                            )}
                        </small>
                    </div>
                )}
            </div>

            <div className="card-footer bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex flex-column">
                        {product.hasActiveDiscount ? (
                            <>
                                <span className="text-decoration-line-through text-muted small">
                                    {product.price.toFixed(2)} PLN
                                </span>
                                <span className="h5 mb-0 text-danger fw-bold">
                                    {product.finalPrice.toFixed(2)} PLN
                                </span>
                                <span className="text-success small">
                                    Save {(product.price - product.finalPrice).toFixed(2)} PLN
                                </span>
                            </>
                        ) : (
                            <span className="h5 mb-0 text-primary">
                                {product.price.toFixed(2)} PLN
                            </span>
                        )}
                    </div>
                    <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {product.quantity > 0 ? `${product.quantity} pcs` : 'Out of stock'}
                    </span>
                </div>

                <Link
                    to={`/products/${product.id}`}
                    className={`btn w-100 ${product.hasActiveDiscount ? 'btn-danger' : 'btn-outline-primary'}`}
                >
                    {product.hasActiveDiscount ? 'Buy now!' : 'Details'}
                </Link>
            </div>
        </div>
    );
}

export default ProductCard;