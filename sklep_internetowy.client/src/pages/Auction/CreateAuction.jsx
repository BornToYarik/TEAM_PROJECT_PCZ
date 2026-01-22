import { useEffect, useState } from "react";
import { createAuction } from "../../api/auctionApi";
import axios from "axios";
import { isAdmin } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom";

/**
 * @file CreateAuction.jsx
 * @brief Komponent umożliwiający administratorowi tworzenie nowych aukcji.
 * @details Moduł pobiera listę produktów z katalogu i pozwala na wystawienie ich na licytację 
 * z określoną ceną startową oraz czasem trwania. Zintegrowany z systemem uprawnień.
 */

/**
 * @component CreateAuction
 * @description Renderuje zaawansowany formularz do zakładania aukcji. Zawiera walidację uprawnień,
 * obsługę stanów ładowania oraz dynamiczną listę produktów.
 */
export default function CreateAuction() {
    /** @brief Stan przechowujący tablicę produktów pobranych z serwera. */
    const [products, setProducts] = useState([]);
    
    /** @brief Wybrany identyfikator produktu, który ma zostać wystawiony. */
    const [productId, setProductId] = useState("");
    
    /** @brief Cena wywoławcza dla nowej aukcji (PLN). */
    const [price, setPrice] = useState("");
    
    /** @brief Czas trwania aukcji w minutach (wybierany z listy). */
    const [duration, setDuration] = useState("10"); // Domyślnie 10 minut

    /** @brief Flaga blokująca przycisk i wyświetlająca spinner podczas trwania operacji asynchronicznej. */
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const API_URL = "http://localhost:8080";

    /**
     * @effect Inicjalizacja komponentu.
     * @description Pobiera listę produktów z endpointu domowego w celu wypełnienia listy wyboru (select).
     */
    useEffect(() => {
        axios
            .get(`${API_URL}/api/home/Product`)
            .then(res => setProducts(res.data || []))
            .catch(err => console.error("Fetch products error:", err));
    }, []);

    /**
     * @function handleSubmit
     * @async
     * @description Obsługuje zdarzenie wysłania formularza, waliduje dane i wywołuje API aukcji.
     * Po pomyślnym utworzeniu przekierowuje użytkownika do strony głównej.
     * @param {Event} e - Obiekt zdarzenia submit.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productId || !price || !duration) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await createAuction({
                productId: Number(productId),
                startingPrice: Number(price),
                durationMinutes: Number(duration)
            });

            alert("Auction created successfully");
            navigate("/auctions"); // Powrót do listy aukcji
        } catch (err) {
            console.error("Create auction error:", err);
            alert("Failed to create auction. Ensure the product is not already on auction.");
        } finally {
            setLoading(false);
        }
    };

    // Weryfikacja uprawnień administratora przed renderowaniem formularza
    if (!isAdmin()) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger shadow-sm">
                    <i className="bi bi-exclamation-octagon me-2"></i>
                    Access denied. This page is for administrators only.
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h2 className="card-title mb-4 text-center fw-bold">Create New Auction</h2>

                            <form onSubmit={handleSubmit}>
                                {/* Wybór Produktu */}
                                <div className="mb-3">
                                    <label htmlFor="product" className="form-label fw-semibold">
                                        Target Product
                                    </label>
                                    <select
                                        id="product"
                                        className="form-select"
                                        value={productId}
                                        onChange={e => setProductId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose a product to sell --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name || `Product #${p.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cena Wywoławcza */}
                                <div className="mb-3">
                                    <label htmlFor="price" className="form-label fw-semibold">
                                        Starting Price (PLN)
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">zł</span>
                                        <input
                                            id="price"
                                            type="number"
                                            className="form-control"
                                            min="0.01"
                                            step="0.01"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Czas Trwania */}
                                <div className="mb-4">
                                    <label htmlFor="duration" className="form-label fw-semibold">
                                        Auction Duration
                                    </label>
                                    <select
                                        id="duration"
                                        className="form-select"
                                        value={duration}
                                        onChange={e => setDuration(e.target.value)}
                                        required
                                    >
                                        <option value="1">1 minute (Test)</option>
                                        <option value="10">10 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="1440">24 hours</option>
                                        <option value="10080">7 days</option>
                                    </select>
                                    <div className="form-text">Auction will end automatically after this time.</div>
                                </div>

                                {/* Przycisk Akcji */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        "Launch Auction"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}