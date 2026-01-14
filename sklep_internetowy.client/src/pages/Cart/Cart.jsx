import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Alert, Table, Spinner } from 'react-bootstrap';
import { pdf } from '@react-pdf/renderer';
import InvoiceDocument from '../../components/admin/InvoiceGenerator/InvoiceDocument';

function Cart() {
    const { cartItems, clearCart, cartTotal, removeFromCart, updateQuantity } = useCart();
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Blokada przycisku
    const navigate = useNavigate();

    const downloadInvoice = async (orderData) => {
        try {
            const blob = await pdf(<InvoiceDocument order={orderData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `faktura_${orderData.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF generation failed", error);
        }
    };

    const handleCheckout = async () => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            setStatus({ type: 'danger', msg: 'You must login to place an order!' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const user = JSON.parse(storedUser);

        // Zabezpieczenie przed podwójnym kliknięciem
        setIsProcessing(true);
        setStatus({ type: '', msg: '' });

        const orderDto = {
            userId: user.id,
            products: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        try {
            // Strzelamy do backendu -> To tutaj Backend tworzy zamówienie i WYSYŁA MAILA
            const response = await fetch('/api/Orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDto)
            });

            if (!response.ok) {
                // Próba odczytania błędu jako JSON lub Text
                const contentType = response.headers.get("content-type");
                let errorMessage = 'Order failed';
                if (contentType && contentType.includes("application/json")) {
                    const errData = await response.json();
                    errorMessage = errData.message || errorMessage;
                } else {
                    errorMessage = await response.text();
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Generujemy fakturę
            await downloadInvoice(data);

            // Sukces!
            setIsOrderSuccess(true);
            clearCart();
            setStatus({ type: 'success', msg: 'Order created! Email sent.' });

            // Przekierowanie po 3 sekundach
            setTimeout(() => navigate('/'), 3000);

        } catch (err) {
            console.error("Checkout error:", err);
            setStatus({ type: 'danger', msg: err.message || "Server error occurred." });
            setIsProcessing(false); // Odblokuj przycisk w razie błędu
        }
    };

    // Widok sukcesu (po zamówieniu)
    if (isOrderSuccess) {
        return (
            <div className="container py-5 text-center">
                <div className="card shadow-sm p-5 border-success">
                    <div className="card-body">
                        <i className="bi bi-check-circle-fill text-success display-1 mb-4"></i>
                        <h2 className="fw-bold text-success mb-3">Order Placed Successfully!</h2>
                        <p className="fs-5 text-muted">Thank you for your purchase.</p>
                        <p className="text-muted fw-bold">An email confirmation has been sent.</p>
                        <p className="text-muted small">Your invoice is downloading automatically...</p>
                        <div className="spinner-border text-success mt-3" role="status">
                            <span className="visually-hidden">Redirecting...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Widok pustego koszyka
    if (cartItems.length === 0) {
        return (
            <div className="container py-5">
                <h2 className="fw-bold mb-4">Your Cart</h2>
                <div className="bg-light p-5 rounded shadow-sm text-center">
                    <p className="fs-5 text-muted">Your cart is currently empty.</p>
                    <i className="bi bi-cart-x fs-1 text-secondary mb-3 d-block"></i>
                    <Link to="/" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4">Your Cart</h2>

            {status.msg && <Alert variant={status.type}>{status.msg}</Alert>}

            <div className="row">
                {/* Lista produktów */}
                <div className="col-lg-8">
                    {cartItems.map((item) => (
                        <div key={item.id} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="text-muted mb-0">Price: {item.price} zl</p>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-sm btn-outline-secondary me-2"
                                            onClick={() => updateQuantity(item.id, -1)}
                                            disabled={isProcessing}
                                        >-</button>
                                        <span className="fw-bold mx-2">{item.quantity}</span>
                                        <button
                                            className="btn btn-sm btn-outline-secondary ms-2"
                                            onClick={() => updateQuantity(item.id, 1)}
                                            disabled={isProcessing}
                                        >+</button>
                                    </div>

                                    <div className="text-end">
                                        <p className="fw-bold mb-1">{(item.price * item.quantity).toFixed(2)} zl</p>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => removeFromCart(item.id)}
                                            disabled={isProcessing}
                                        >
                                            <i className="bi bi-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-3">
                        <Link to="/" className={`btn btn-outline-primary ${isProcessing ? 'disabled' : ''}`}>
                            <i className="bi bi-arrow-left me-2"></i>
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* Podsumowanie */}
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
                                onClick={handleCheckout}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Go to Payment (Checkout)'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;