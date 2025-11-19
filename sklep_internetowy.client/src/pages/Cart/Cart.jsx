import React from "react";
import { useCart } from "../../context/CartContext"; 

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container py-5">
                <h2 className="fw-bold mb-4">Your Cart</h2>
                <div className="bg-light p-5 rounded shadow-sm text-center">
                    <p className="fs-5 text-muted">Your cart is currently empty.</p>
                    <i className="bi bi-cart-x fs-1 text-secondary"></i>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4">Your Cart</h2>

            <div className="row">
                {/*  */}
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
                                        {/* */}
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span className="fw-bold mx-2">{item.quantity}</span>
                                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>

                                    <div className="text-end">
                                        <p className="fw-bold mb-1">{(item.price * item.quantity).toFixed(2)} zl</p>
                                        {/*  */}
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
                </div>

                {/* */}
                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h4 className="card-title mb-4">Summary</h4>
                            <div className="d-flex justify-content-between mb-3">
                                <span>All:</span>
                                <span className="fw-bold fs-5">{cartTotal.toFixed(2)} zl</span>
                            </div>
                            <button className="btn btn-success w-100 py-2">
                                Go to payment (Checkout)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;