import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Edit } from 'lucide-react';
/**
 * @file ProductCard.jsx
 * @brief Komponent karty produktu dedykowany dla panelu administracyjnego.
 */

/**
 * @component ProductCard
 * @description Wyswietla skrocone informacje o produkcie w formie karty. 
 * Zawiera funkcje zarzadzania produktem, takie jak edycja i usuwanie, oraz wizualna informacje o promocjach.
 * @param {Object} props - Wlasciwosci komponentu.
 * @param {Object} props.product - Obiekt danych produktu (ID, nazwa, cena, stan, rabaty).
 * @param {Function} props.onEdit - Funkcja wywolywana przy kliknieciu przycisku edycji, przyjmuje obiekt produktu.
 * @param {Function} props.onDelete - Funkcja wywolywana po potwierdzeniu usuniecia, przyjmuje ID produktu.
 */
function ProductCard({ product, onEdit, onDelete }) {
    /** * @brief Flaga okreslajaca, czy produkt posiada obecnie aktywna znizke.
     */
    const isDiscount = product.hasActiveDiscount && product.finalPrice < product.price;
      /**
      * @function handleDelete
      * @description Wyswietla systemowe okno potwierdzenia. Jesli uzytkownik zatwierdzi,
      * wywoluje funkcje onDelete przekazana w parametrach.
      */
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            onDelete(product.id);
        }
    };



    return (
        <div className="card h-100 shadow-sm position-relative">
            {isDiscount && (
                <div className="position-absolute top-0 start-0 m-2 badge bg-info text-white rounded-pill">
                    Sale!
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
            <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                {product.description && (
                    <p className="card-text text-muted small">{product.description}</p>
                )}
            </div>
            <div className="card-footer bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    {isDiscount ? (
                        <div className="d-flex flex-column">
                            <span className="h5 mb-0 text-danger">{product.finalPrice.toFixed(2)} zl</span>
                            <del className="text-muted small">{product.price.toFixed(2)} zl</del>
                        </div>
                    ) : (
                        <span className="h5 mb-0 text-primary">{product.price.toFixed(2)} zl</span>
                    )}

                    <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {product.quantity > 0 ? `${product.quantity} pcs` : 'Out of stock'}
                    </span>
                </div>
                <Link to={`/admin/products/${product.id}`} className="btn btn-outline-primary w-100">
                    Details
                </Link>
            </div>
        </div>
    );
}

export default ProductCard;
