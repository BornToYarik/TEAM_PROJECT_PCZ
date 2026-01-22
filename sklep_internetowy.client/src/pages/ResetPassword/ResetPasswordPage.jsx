import React, { useState } from "react";
import { useParams } from "react-router-dom";

/**
 * @file ResetPasswordForm.jsx
 * @brief Komponent formularza ustawiania nowego hasla po zresetowaniu dostepu.
 * @details Pozwala uzytkownikowi na wprowadzenie i potwierdzenie nowego hasla przy uzyciu 
 * unikalnego tokenu otrzymanego w procesie odzyskiwania konta. Zawiera walidacje zgodnosci haseł.
 */

/**
 * @component ResetPasswordForm
 * @description Renderuje interfejs do zmiany zapomnianego hasla. Zarzadza lokalnym stanem 
 * nowych poswiadczen i obsluguje logike wysylania danych do serwera.
 */
export default function ResetPasswordForm() {
    /** @brief Pobranie unikalnego tokenu resetujacego z parametrow sciezki URL. */
    const { token } = useParams();

    /** @brief Stan przechowujacy wpisane nowe haslo. */
    const [password, setPassword] = useState("");
    /** @brief Stan przechowujacy potwierdzenie nowego hasla w celu weryfikacji. */
    const [confirm, setConfirm] = useState("");

    /**
     * @function handleSubmit
     * @description Obsluguje zdarzenie przeslania formularza zmiany hasla.
     * @details Sprawdza, czy oba wprowadzone hasla sa identyczne. Jesli tak, loguje 
     * token oraz nowe haslo w konsoli (miejsce na integracje z API).
     * @param {Event} e - Obiekt zdarzenia formularza.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Walidacja zgodnosci haseł po stronie klienta
        if (password !== confirm) {
            alert("Hasla musza byc takie same!");
            return;
        }

        // TODO: wyslij nowe haslo + token do backendu za pomoca fetch/axios
        console.log("Token:", token);
        console.log("New Password:", password);

        alert("Twoje haslo zostalo zresetowane.");
    };

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 border rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Ustaw nowe haslo</h2>

            <form onSubmit={handleSubmit}>
                <label className="block mb-3">
                    <span className="font-medium">Nowe haslo:</span>
                    <input
                        type="password"
                        required
                        className="block w-full border rounded p-2 mt-1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <label className="block mb-3">
                    <span className="font-medium">Powtorz haslo:</span>
                    <input
                        type="password"
                        required
                        className="block w-full border rounded p-2 mt-1"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </label>

                <button
                    type="submit"
                    className="w-full mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Zmien haslo
                </button>
            </form>
        </div>
    );
}