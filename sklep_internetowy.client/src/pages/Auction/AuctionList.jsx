import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveAuctions } from "../../api/auctionApi";
import { isAdmin } from "../../utils/authUtils";

/**
 * @file AuctionList.jsx
 * @brief Komponent wyswietlajacy liste aktywnych aukcji w systemie.
 * @details Modul odpowiada za pobieranie danych o trwajacych licytacjach z API, 
 * ich prezentacje w formie kart oraz zapewnia nawigacje do szczegolow kazdej aukcji.
 */

/**
 * @component AuctionList
 * @description Glowny widok publiczny dla modulu aukcji. Zarzadza stanem ladowania danych, 
 * obsluga bledow oraz renderowaniem listy licytacji.
 */
export default function AuctionList() {
    /** @brief Stan przechowujacy tablice aktywnych aukcji pobranych z serwera. */
    const [auctions, setAuctions] = useState([]);
    /** @brief Flaga logiczna okreslajaca, czy trwa proces pobierania danych. */
    const [loading, setLoading] = useState(true);
    /** @brief Przechowuje informacie o bledzie w przypadku niepowodzenia komunikacji z API. */
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    /**
     * @effect Inicjalizacja komponentu: asynchroniczne pobieranie listy aukcji.
     * @details Wywoluje funkcje getActiveAuctions i aktualizuje stany komponentu.
     */
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const data = await getActiveAuctions();
                console.log("API response:", data);
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
     * @function goToCreateAuction
     * @description Funkcja nawigacyjna przekierowujaca administratora do formularza tworzenia aukcji.
     */
    const goToCreateAuction = () => {
        navigate("/admin/create-auction");
    };

    if (loading) return <p>Loading auctions...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Active Auctions</h1>

            {/* Sekcja widoczna tylko dla uzytkownikow z uprawnieniami administratora */}
            {isAdmin() && (
                <button
                    onClick={goToCreateAuction}
                    className="btn btn-warning"
                    style={{ marginBottom: 20 }}
                >
                    Create New Auction
                </button>
            )}

            {/* Logika warunkowego wyswietlania pustej listy lub kart aukcji */}
            {auctions.length === 0 ? (
                <p>No active auctions at the moment.</p>
            ) : (
                auctions.map(a => (
                    <div
                        key={a.id}
                        style={{
                            border: "1px solid gray",
                            padding: 10,
                            marginBottom: 10
                        }}
                    >
                        <h3>
                            {a.product?.name ?? `Product #${a.productId}`}
                        </h3>

                        <p>Price: {a.currentPrice} USD</p>

                        <p>
                            Ends at:{" "}
                            {a.endTime
                                ? new Date(a.endTime).toLocaleString()
                                : "Unknown"}
                        </p>

                        {/* Link prowadzacy do widoku szczegolowego konkretnej licytacji */}
                        <Link to={`/auction/${a.id}`}>View Bids</Link>
                    </div>
                ))
            )}
        </div>
    );
}