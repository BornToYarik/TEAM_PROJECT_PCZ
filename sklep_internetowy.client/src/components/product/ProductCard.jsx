import { Link } from 'react-router-dom';

function ProductCard({ product }) {
    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
            </div>
            <div className="card-footer bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="h5 mb-0 text-primary">{product.price.toFixed(2)} PLN</span>
                    <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {product.quantity > 0 ? `${product.quantity} szt.` : 'Brak'}
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