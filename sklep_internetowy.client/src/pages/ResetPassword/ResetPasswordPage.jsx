// ResetPasswordForm.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function ResetPasswordForm() {
    const { token } = useParams(); // token z linku resetującego
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirm) {
            alert("Hasła muszą być takie same!");
            return;
        }

        // TODO: wyślij nowe hasło + token do backendu
        console.log("Token:", token);
        console.log("New Password:", password);

        alert("Twoje hasło zostało zresetowane.");
    };

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 border rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Ustaw nowe hasło</h2>

            <form onSubmit={handleSubmit}>
                <label className="block mb-3">
                    <span className="font-medium">Nowe hasło:</span>
                    <input
                        type="password"
                        required
                        className="block w-full border rounded p-2 mt-1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <label className="block mb-3">
                    <span className="font-medium">Powtórz hasło:</span>
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
                    Zmień hasło
                </button>
            </form>
        </div>
    );
}
