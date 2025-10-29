import React from "react";

function Cart() {
    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4">Your Cart</h2>
            <div className="bg-light p-5 rounded shadow-sm text-center">
                <p className="fs-5 text-muted">
                    Your cart is currently empty.
                </p>
                <i className="bi bi-cart-x fs-1 text-secondary"></i>
            </div>
        </div>
    );
}

export default Cart;
