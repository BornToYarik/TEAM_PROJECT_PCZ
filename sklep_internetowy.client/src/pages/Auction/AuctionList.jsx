import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveAuctions } from "../../api/auctionApi";
import { isAdmin } from "../../utils/authUtils";

/**
 * @file AuctionList.jsx
 * @brief Komponent wyświetlający listę aktywnych aukcji w systemie.
 * @details Moduł odpowiada za pobieranie danych o trwających licytacjach z API, 
 * ich prezentację w formie nowoczesnych kart oraz zapewnia nawigację do szczegółów każdej aukcji.
 */

/**
 * @component AuctionList
 * @description Główny widok publiczny dla modułu aukcji. Zarządza stanem ładowania danych, 
 * obsługą błędów oraz responsywnym renderowaniem listy licytacji.
 */
export default function AuctionList() {
    /** @brief Stan przechowujący tablicę aktywnych aukcji pobranych z serwera. */
    const [auctions, setAuctions] = useState([]);
    
    /** @brief Flaga logiczna określająca, czy trwa proces pobierania danych. */
    const [loading, setLoading] = useState(true);
    
    /** @brief Przechowuje informacje o błędzie w przypadku niepowodzenia komunikacji z API. */
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const API_URL = "http://localhost:8080";

    /**
     * @effect Inicjalizacja komponentu: asynchroniczne pobieranie listy aukcji.
     * @details Wywołuje funkcję getActiveAuctions i aktualizuje stany komponentu.
     */
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const data = await getActiveAuctions();
                setAuctions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch auctions:", err);
                setError("Failed to load auctions");
                setAuctions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    /**
     * @function getTimeRemaining
     * @description Pomocnicza funkcja obliczająca czas pozostały do zakończenia licytacji.
     * @param {string} endTime - Data zakończenia aukcji w formacie ISO.
     * @returns {string} Sformatowany czas (np. "2h 15m") lub "Ended".
     */
    const getTimeRemaining = (endTime) => {
        const now = Date.now();
        const end = new Date(endTime).getTime();
        const diff = end - now;

        if (diff <= 0) return "Ended";

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    /**
     * @function goToCreateAuction
     * @description Funkcja nawigacyjna przekierowująca administratora do formularza tworzenia aukcji.
     */
    const goToCreateAuction = () => {
        navigate("/admin/create-auction");
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2">Active Auctions</h1>
                <div className="d-flex gap-2">
                    {/* Sekcja widoczna tylko dla użytkowników z uprawnieniami administratora */}
                    {isAdmin() && (
                        <button onClick={goToCreateAuction} className="btn btn-warning shadow-sm">
                            <i className="bi bi-plus-circle me-1"></i> Create New Auction
                        </button>
                    )}
                    <button onClick={() => navigate("/my-auction-wins")} className="btn btn-primary shadow-sm">
                        <i className="bi bi-trophy me-1"></i> My won auctions
                    </button>
                </div>
            </div>

            {/* Logika warunkowego wyświetlania pustej listy lub siatki kart aukcji */}
            {auctions.length === 0 ? (
                <div className="alert alert-info text-center py-5 shadow-sm">
                    <i className="bi bi-info-circle fs-2 d-block mb-2"></i>
                    <p className="mb-0">No active auctions at the moment. Check back later!</p>
                </div>
            ) : (
                <div className="row g-4">
                    {auctions.map(a => {
                        const firstImage = a.product?.imageUrls?.[0];
                        const imageUrl = firstImage
                            ? (firstImage.startsWith("http") ? firstImage : `${API_URL}${firstImage}`)
                            : "/placeholder.png";

                        return (
                            <div key={a.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm border-0 transition-hover">
                                    <div className="position-relative">
                                        <img
                                            src={imageUrl}
                                            alt={a.product?.name}
                                            className="card-img-top rounded-top"
                                            style={{ height: "250px", objectFit: "cover", backgroundColor: "#f8f9fa" }}
                                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                                        />
                                        <span className="badge bg-danger position-absolute top-0 end-0 m-2 shadow-sm">
                                            <i className="bi bi-record-fill me-1"></i>Live
                                        </span>
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fw-bold">
                                            {a.product?.name ?? `Product #${a.productId}`}
                                        </h5>

                                        <div className="my-2 p-2 bg-light rounded">
                                            <small className="text-muted d-block uppercase-label">Current bid</small>
                                            <h4 className="text-primary mb-0 fw-bold">{a.currentPrice} PLN</h4>
                                        </div>

                                        {a.currentWinnerName && (
                                            <div className="mb-2">
                                                <small className="text-muted">Leading bidder: </small>
                                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                    {a.currentWinnerName}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-3 text-muted small mt-auto">
                                            <i className="bi bi-clock me-1 text-danger"></i>
                                            <strong>Ends in:</strong> {getTimeRemaining(a.endTime)}
                                        </div>

                                        <Link
                                            to={`/auction/${a.id}`}
                                            className="btn btn-outline-primary w-100 mt-2"
                                        >
                                            View details & Bid →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}