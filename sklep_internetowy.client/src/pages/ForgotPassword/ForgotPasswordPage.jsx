// ForgotPasswordPage.jsx
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // TODO: podłącz do backendu — fetch/axios
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
