import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { pdf } from '@react-pdf/renderer';
import InvoiceDocument from '../../components/admin/InvoiceGenerator/InvoiceDocument';

/**
 * @file PaymentPage.jsx
 * @brief Komponent obsługujący proces płatności elektronicznych Stripe oraz finalizację zamówienia.
 * @details Moduł integruje się z bramką płatności Stripe, zarządza tworzeniem PaymentIntent 
 * na serwerze, potwierdzaniem transakcji oraz automatycznym generowaniem faktury PDF po sukcesie.
 * Obsługuje zarówno standardowe produkty, jak i przedmioty wygrane w aukcjach.
 */

/** @brief Inicjalizacja obiektu Stripe przy użyciu klucza publicznego ze zmiennych środowiskowych. */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * @component CheckoutForm
 * @description Podkomponent renderujący formularz płatności (PaymentElement).
 * Zarządza komunikacją z API Stripe w celu potwierdzenia środków.
 * @param {Object} props - Właściwości komponentu.
 * @param {Function} props.onSuccess - Callback wywoływany po pomyślnej autoryzacji płatności.
 * @param {number} props.amount - Całkowita kwota do zapłaty.
 */
const CheckoutForm = ({ onSuccess, amount }) => {
    const stripe = useStripe();
    const elements = useElements();

    /** @brief Przechowuje komunikaty o błędach płatności. */
    const [message, setMessage] = useState(null);

    /** @brief Flaga blokująca interfejs podczas przetwarzania transakcji. */
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * @function handleSubmit
     * @async
     * @description Obsługuje zdarzenie wysłania formularza płatności do Stripe.
     * @param {Event} e - Obiekt zdarzenia submit.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: window.location.origin },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            await onSuccess(paymentIntent.id);
        } else {
            setMessage("Unexpected error occurred during payment.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded bg-white shadow-sm">
            <PaymentElement />
            <button
                disabled={isProcessing || !stripe || !elements}
                className="btn btn-primary mt-4 w-100 fw-bold py-2"
            >
                {isProcessing ? "Processing..." : `Pay ${amount.toFixed(2)} PLN`}
            </button>
            {message && <div className="text-danger mt-3 small text-center">{message}</div>}
        </form>
    );
};

/**
 * @component PaymentPage
 * @description Główny komponent strony płatności. Pobiera clientSecret z backendu, 
 * wyświetla podsumowanie koszyka i zarządza procesem zapisu zamówienia oraz oznaczania aukcji.
 */
export default function PaymentPage() {
    /** @brief Dane pobrane z kontekstu koszyka zakupowego. */
    const { cartItems, cartTotal, clearCart } = useCart();

    /** @brief Klucz sesji płatności otrzymany z serwera. */
    const [clientSecret, setClientSecret] = useState("");

    const navigate = useNavigate();

    /** @effect Przekierowanie do koszyka, jeśli jest on pusty. */
    useEffect(() => {
        if (cartItems.length === 0) navigate("/cart");
    }, [cartItems, navigate]);

    /** * @effect Pobieranie PaymentIntent.
     * @description Tworzy zamiar płatności na serwerze na podstawie wartości koszyka.
     */
    useEffect(() => {
        if (cartTotal > 0) {
            fetch("/api/payment/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: cartTotal }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret))
                .catch(err => console.error("Error fetching payment intent:", err));
        }
    }, [cartTotal]);

    /**
     * @function handleOrderSuccess
     * @async
     * @description Finalizuje proces zakupowy: zapisuje zamówienie w bazie danych, 
     * oznacza aukcje jako opłacone, generuje plik PDF z fakturą i czyści koszyk.
     * @param {string} paymentId - Identyfikator pomyślnej płatności Stripe.
     */
    const handleOrderSuccess = async (paymentId) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem('token');

        const orderDto = {
            userId: user.id,
            products: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                auctionId: item.auctionId // Przekazanie ID aukcji, jeśli produkt pochodzi z licytacji
            })),
        };

        try {
            // 1. Zapis zamówienia w bazie danych
            const response = await fetch('/api/Orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderDto)
            });

            if (!response.ok) throw new Error("Failed to save order in database");
            const data = await response.json();

            // 2. Oznaczenie aukcji jako opłaconych (jeśli dotyczy)
            const auctionItems = cartItems.filter(item => item.auctionId);
            for (const item of auctionItems) {
                try {
                    await fetch('/api/auction-winner/mark-auction-paid', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ auctionId: item.auctionId, orderId: data.id })
                    });
                } catch (err) {
                    console.error('Error marking auction as paid:', err);
                }
            }

            // 3. Generowanie i automatyczne pobieranie faktury PDF
            try {
                const blob = await pdf(<InvoiceDocument order={data} />).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `faktura_TechStore_${data.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (e) {
                console.error("PDF generation failed:", e);
            }

            // 4. Finalizacja UI
            clearCart();
            alert("Payment successful! Your order has been placed.");
            navigate('/profile');

        } catch (err) {
            console.error("Order completion error:", err);
            alert("Payment was successful, but we encountered an error while processing your order. Please contact support.");
        }
    };

    return (
        <div className="container mt-5 py-5" style={{ maxWidth: "600px" }}>
            <div className="text-center mb-4">
                <i className="bi bi-credit-card-2-front fs-1 text-primary"></i>
                <h2 className="mt-2 fw-bold">Secure Checkout</h2>
                <p className="text-muted">Total to pay: <strong>{cartTotal.toFixed(2)} PLN</strong></p>
            </div>

            {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm onSuccess={handleOrderSuccess} amount={cartTotal} />
                </Elements>
            ) : (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading payment session...</span>
                    </div>
                    <p className="mt-2 text-muted">Preparing secure payment session...</p>
                </div>
            )}

            <div className="mt-4 text-center small text-muted">
                <i className="bi bi-shield-lock me-1"></i>
                Your payment data is encrypted and processed securely via Stripe.
            </div>
        </div>
    );
}