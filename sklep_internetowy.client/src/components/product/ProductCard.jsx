// components/product/ProductCard.jsx
import { Link } from 'react-router-dom';
import { Trash2, Edit } from 'lucide-react';

function ProductCard({ product, onEdit, onDelete }) {
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            onDelete(product.id);
        }
    };

    return (
        <div className="card h-100 shadow-sm position-relative">
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

            <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                {product.description && (
                    <p className="card-text text-muted small">{product.description}</p>
                )}
            </div>
            <div className="card-footer bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="h5 mb-0 text-primary">{product.price.toFixed(2)} PLN</span>
                    <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {product.quantity > 0 ? `${product.quantity} pcs` : 'Out of stock'}
                    </span>
                </div>
                <Link to={`/products/${product.id}`} className="btn btn-outline-primary w-100">
                    Details
                </Link>
            </div>
        </div>
    );
}

export default ProductCard;