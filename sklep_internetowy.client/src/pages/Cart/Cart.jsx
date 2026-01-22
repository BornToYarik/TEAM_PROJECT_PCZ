import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

/**
 * @file Cart.jsx
 * @brief Komponent widoku koszyka zakupowego aplikacji TechStore.
 * @details Modul odpowiada za prezentacje przedmiotow dodanych przez uzytkownika, 
 * umozliwia modyfikacje ich ilosci, usuwanie pozycji oraz inicjuje proces skladania zamowienia.
 */

/**
 * @component Cart
 * @description Renderuje interfejs koszyka. Wykorzystuje dane z CartContext do wyswietlania 
 * dynamicznej listy produktow oraz obliczania sumy zamowienia.
 */
function Cart() {
    /** @brief Dane i metody pobrane z globalnego stanu koszyka. */
    const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    /**
     * @function handleCheckoutClick
     * @description Obsluguje proces przejscia do kasy (Checkout).
     * @details Sprawdza obecnosc zalogowanego uzytkownika w localStorage. 
     * Jesli uzytkownik nie jest uwierzytelniony, wyswietla komunikat i przekierowuje do logowania.
     */
    const handleCheckoutClick = () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("Please login first!");
            navigate('/login');
            return;
        }
        navigate('/payment');
    };

    /** @section EmptyState
     * Renderowanie widoku w przypadku braku produktow w koszyku.
     */
    if (cartItems.length === 0) {
        return (
            <div className="container py-5 text-center">
                <h2>Your Cart is Empty</h2>
                <Link to="/" className="btn btn-primary mt-3">Go Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4">Your Cart</h2>

            <div className="row">
                {/* KOLUMNA LEWA: Lista produktow w koszyku */}
                <div className="col-lg-8">
                    {cartItems.map((item) => (
                        <div key={item.id} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    {/* Informacje o produkcie */}
                                    <div>
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="text-muted mb-0">Price: {item.price} zl</p>
                                    </div>

                                    {/* Kontrola ilosci (Update Quantity) */}
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-sm btn-outline-secondary me-2"
                                            onClick={() => updateQuantity(item.id, -1)}
                                        >-</button>

                                        <span className="fw-bold mx-2">{item.quantity}</span>

                                        <button
                                            className="btn btn-sm btn-outline-secondary ms-2"
                                            onClick={() => updateQuantity(item.id, 1)}
                                        >+</button>
                                    </div>

                                    {/* Podsumowanie pozycji i usuwanie (Delete) */}
                                    <div className="text-end">
                                        <p className="fw-bold mb-1">{(item.price * item.quantity).toFixed(2)} zl</p>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-3">
                        <Link to="/" className="btn btn-outline-primary">
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* KOLUMNA PRAWA: Podsumowanie zamowienia (Summary) */}
                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h4 className="card-title mb-4">Summary</h4>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Total:</span>
                                <span className="fw-bold fs-5">{cartTotal.toFixed(2)} zl</span>
                            </div>

                            <button
                                className="btn btn-success w-100 py-2"
                                onClick={handleCheckoutClick}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;