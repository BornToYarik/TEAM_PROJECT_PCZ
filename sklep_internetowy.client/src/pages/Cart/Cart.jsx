import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Alert, Table } from 'react-bootstrap';
import { pdf } from '@react-pdf/renderer';
import InvoiceDocument from '../../components/admin/InvoiceGenerator/InvoiceDocument';
function Cart() {
    const { cartItems, clearCart, cartTotal, removeFromCart, updateQuantity } = useCart();
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
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
            setStatus({ type: 'danger', msg: 'You must login to consume order!' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const user = JSON.parse(storedUser);
        //const token = localStorage.getItem("token"); 

        const orderDto = {
            userId: user.id, 
            products: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await fetch('/api/Orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderDto)
            });
            const data = await response.json();
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Order failed');
            }
            await downloadInvoice(data);
            setIsOrderSuccess(true);

            clearCart();
            setStatus({ type: 'success', msg: 'Order created!' });
            setTimeout(() => navigate('/'), 3000);

        } catch (err) {
            setStatus({ type: 'danger', msg: err.message });
        }
    };

    if (isOrderSuccess) {
        return (
            <div className="container py-5 text-center">
                <div className="card shadow-sm p-5 border-success">
                    <div className="card-body">
                        <i className="bi bi-check-circle-fill text-success display-1 mb-4"></i>
                        <h2 className="fw-bold text-success mb-3">Order Placed Successfully!</h2>
                        <p className="fs-5 text-muted">Thank you for your purchase.</p>
                        <p className="text-muted fw-bold">Your invoice is downloading automatically...</p> {/* Добавил текст */}
                        <p className="text-muted">You will be redirected to the home page shortly...</p>
                        <div className="spinner-border text-success mt-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                {/* Список товаров */}
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
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span className="fw-bold mx-2">{item.quantity}</span>
                                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>

                                    <div className="text-end">
                                        <p className="fw-bold mb-1">{(item.price * item.quantity).toFixed(2)} zl</p>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <i className="bi bi-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Кнопка "Continue Shopping" под списком товаров */}
                    <div className="mt-3">
                        <Link to="/" className="btn btn-outline-primary">
                            <i className="bi bi-arrow-left me-2"></i>
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* Итого и кнопка заказа */}
                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h4 className="card-title mb-4">Summary</h4>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Total:</span>
                                <span className="fw-bold fs-5">{cartTotal.toFixed(2)} zl</span>
                            </div>
                            <button className="btn btn-success w-100 py-2" onClick={handleCheckout}>
                                Go to Payment (Checkout)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;