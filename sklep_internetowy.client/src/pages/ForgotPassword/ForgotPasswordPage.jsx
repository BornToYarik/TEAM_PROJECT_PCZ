import { useState } from "react";

/**
 * @file ForgotPasswordPage.jsx
 * @brief Komponent strony odzyskiwania zapomnianego hasla.
 * @details Pozwala uzytkownikowi na wprowadzenie adresu e-mail, na ktory zostanie wyslany link resetujacy dostep do konta.
 */

/**
 * @component ForgotPasswordPage
 * @description Renderuje minimalistyczny formularz zapytania o reset hasla. 
 * Zarzadza lokalnym stanem adresu e-mail i obsluguje logike wysylania danych.
 */
export default function ForgotPasswordPage() {
    /** @brief Stan przechowujacy wprowadzony przez uzytkownika adres e-mail. */
    const [email, setEmail] = useState("");

    /**
     * @function handleSubmit
     * @description Obsluguje zdarzenie przeslania formularza.
     * @details Obecnie funkcja loguje adres e-mail w konsoli i wyswietla systemowy komunikat alert. 
     * Jest to miejsce przeznaczone na integracje z API (fetch/axios).
     * @param {Event} e - Obiekt zdarzenia formularza.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // TODO: podlacz do backendu — fetch/axios
        console.log("Forgot password request sent for:", email);

        alert(
            "If an account with this email exists, a reset link has been sent."
        );
    };

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 border rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>

            <form onSubmit={handleSubmit}>
                <label className="block mb-3">
                    <span className="font-medium">Email address:</span>
                    <input
                        type="email"
                        required
                        className="block w-full border rounded p-2 mt-1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <button
                    type="submit"
                    className="w-full mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Send reset link
                </button>
            </form>
        </div>
    );
}