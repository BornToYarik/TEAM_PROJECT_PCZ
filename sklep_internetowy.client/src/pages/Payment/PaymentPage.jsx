import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { pdf } from '@react-pdf/renderer';
import InvoiceDocument from '../../components/admin/InvoiceGenerator/InvoiceDocument';

/**
 * @file PaymentPage.jsx
 * @brief Komponent obslugujacy proces platnosci elektronicznych Stripe oraz finalizacje zamowienia.
 * @details Modul integruje sie z bramka platnosci Stripe, zarzadza tworzeniem PaymentIntent 
 * na serwerze, potwierdzaniem transakcji oraz automatycznym generowaniem faktury PDF po sukcesie.
 */

/** @brief Inicjalizacja obiektu Stripe przy uzyciu klucza publicznego ze zmiennych srodowiskowych. */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * @component CheckoutForm
 * @description Podkomponent renderujacy formularz platnosci (PaymentElement).
 * Zarzadza komunikacja z API Stripe w celu potwierdzenia srodkow.
 * @param {Object} props - Wlasciwosci komponentu.
 * @param {Function} props.onSuccess - Callback wywolywany po pomyslnej autoryzacji platnosci.
 * @param {number} props.amount - Calkowita kwota do zaplaty.
 */
const CheckoutForm = ({ onSuccess, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    /** @brief Przechowuje komunikaty o bledach platnosci. */
    const [message, setMessage] = useState(null);
    /** @brief Flaga blokujaca interfejs podczas przetwarzania transakcji. */
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * @function handleSubmit
     * @async
     * @description Obsluguje zdarzenie wyslania formularza platnosci do Stripe.
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
            setMessage("Unexpected error.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button
                disabled={isProcessing || !stripe || !elements}
                className="btn btn-primary mt-3 w-100"
            >
                {isProcessing ? "Processing..." : `Pay ${amount.toFixed(2)} zl`}
            </button>
            {message && <div className="text-danger mt-2">{message}</div>}
        </form>
    );
};

/**
 * @component PaymentPage
 * @description Glowny komponent strony platnosci. Pobiera clientSecret z backendu, 
 * wyswietla podsumowanie koszyka i zarzadza procesem zapisu zamowienia w bazie danych.
 */
export default function PaymentPage() {
    /** @brief Dane pobrane z kontekstu koszyka zakupowego. */
    const { cartItems, cartTotal, clearCart } = useCart();
    /** @brief Klucz sesji platnosci otrzymany z serwera. */
    const [clientSecret, setClientSecret] = useState("");
    const navigate = useNavigate();

    /** @effect Przekierowanie do koszyka, jesli jest on pusty. */
    useEffect(() => {
        if (cartItems.length === 0) navigate("/cart");
    }, [cartItems, navigate]);

    /** * @effect Pobieranie PaymentIntent.
     * @description Tworzy zamiar platnosci na serwerze na podstawie wartosci koszyka.
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
                .catch(err => console.error("Error fetching intent:", err));
        }
    }, [cartTotal]);

    /**
     * @function handleOrderSuccess
     * @async
     * @description Finalizuje proces zakupowy: zapisuje zamowienie w bazie danych, 
     * generuje plik PDF z faktura i czysci koszyk.
     * @param {string} paymentId - Identyfikator pomyslnej platnosci Stripe.
     */
    const handleOrderSuccess = async (paymentId) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const orderDto = {
            userId: user.id,
            products: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            })),
        };

        try {
            const response = await fetch('/api/Orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDto)
            });

            if (!response.ok) throw new Error("Order failed");
            const data = await response.json();

            // Generowanie i pobieranie faktury PDF
            try {
                const blob = await pdf(<InvoiceDocument order={data} />).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `faktura_${data.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (e) { console.error("PDF Error", e); }

            clearCart();
            alert("Payment Successful!");
            navigate('/profile');
        } catch (err) {
            console.error(err);
            alert("Payment passed, but order saving failed.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <h2 className="mb-4">Checkout: {cartTotal.toFixed(2)} zl</h2>
            {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm onSuccess={handleOrderSuccess} amount={cartTotal} />
                </Elements>
            ) : (
                <p>Loading payment...</p>
            )}
        </div>
    );
}