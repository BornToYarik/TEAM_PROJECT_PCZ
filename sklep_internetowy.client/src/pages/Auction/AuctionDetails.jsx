import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuction, placeBid } from "../../api/auctionApi";
import { useAuth } from "../../auth/useAuth";
import * as signalR from "@microsoft/signalr";

/**
 * @file AuctionDetails.jsx
 * @brief Komponent widoku szczegółowego aukcji z obsługą licytacji w czasie rzeczywistym.
 * @details Moduł integruje się z SignalR w celu zapewnienia natychmiastowych aktualizacji ceny 
 * bez konieczności odświeżania strony. Obsługuje uwierzytelnianie JWT, walidację ofert, 
 * galerię zdjęć oraz automatyczny licznik czasu.
 */

/**
 * @component AuctionDetails
 * @description Wyświetla pełne dane aukcji, zarządza cyklem życia połączenia SignalR 
 * oraz umożliwia zalogowanym użytkownikom branie udziału w licytacji.
 */
export default function AuctionDetails() {
    /** @brief Pobranie identyfikatora aukcji z parametrów ścieżki URL. */
    const { id } = useParams();

    /** @brief Status autoryzacji użytkownika pobrany z dedykowanego hooka. */
    const { isAuthenticated } = useAuth();

    /** @brief Stan przechowujący szczegółowe informacje o aukcji (produkt, cena, czas). */
    const [auction, setAuction] = useState(null);

    /** @brief Wartość nowej oferty licytacyjnej wpisana w formularzu. */
    const [amount, setAmount] = useState("");

    /** @brief Flaga kontrolująca blokowanie interfejsu podczas wysyłania oferty. */
    const [loadingBid, setLoadingBid] = useState(false);

    /** @brief Sformatowany ciąg znaków reprezentujący czas pozostały do końca aukcji. */
    const [timeLeft, setTimeLeft] = useState("");

    /** @brief Indeks aktualnie wyświetlanego zdjęcia w galerii. */
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    /** @brief Nazwa użytkownika, który aktualnie prowadzi w licytacji. */
    const [currentWinner, setCurrentWinner] = useState(null);

    /** @brief Referencja do obiektu połączenia SignalR zachowująca stan między renderami. */
    const connectionRef = useRef(null);

    const API_URL = "http://localhost:8080";
    const DEFAULT_IMAGE = "/placeholder.png";

    /**
     * @effect Inicjalizacja komponentu i konfiguracja SignalR.
     * @details Pobiera dane początkowe aukcji i ustanawia połączenie z Hubem aukcyjnym. 
     * Rejestruje handlery dla zdarzeń "BidPlaced" oraz "AuctionFinished".
     */
    useEffect(() => {
        loadAuction();

        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("No token found - SignalR in read-only mode or disabled");
            return;
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/auctionHub`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.start()
            .then(() => connection.invoke("JoinAuction", Number(id)))
            .catch(err => console.error("SignalR connection error:", err));

        /** @callback BidPlaced
         * @description Reaguje na powiadomienie o nowej najwyższej ofercie.
         */
        connection.on("BidPlaced", (price, endTime, winnerName) => {
            setAuction(prev => prev ? { ...prev, currentPrice: price, endTime } : prev);
            setCurrentWinner(winnerName);
        });

        /** @callback AuctionFinished
         * @description Wywoływana przez serwer, gdy czas aukcji dobiegnie końca.
         */
        connection.on("AuctionFinished", (auctionId) => {
            checkIfWinner(auctionId);
        });

        return () => {
            if (connectionRef.current) connectionRef.current.stop();
        };
    }, [id]);

    /**
     * @effect Timer odliczający czas do końca aukcji.
     * @description Aktualizuje stan timeLeft co sekundę na podstawie auction.endTime.
     */
    useEffect(() => {
        if (!auction?.endTime) return;

        const timer = setInterval(() => {
            const now = Date.now();
            const end = new Date(auction.endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("Auction ended");
                clearInterval(timer);
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [auction?.endTime]);

    /**
     * @function loadAuction
     * @description Pobiera aktualny stan aukcji z serwera za pomocą API REST.
     */
    const loadAuction = () => {
        getAuction(id)
            .then(res => {
                if (res.data) {
                    setAuction(res.data);
                    setCurrentWinner(res.data.currentWinnerName);
                }
            })
            .catch(err => {
                console.error("Failed to load auction:", err);
                setAuction(null);
            });
    };

    /**
     * @function checkIfWinner
     * @async
     * @description Sprawdza, czy zalogowany użytkownik wygrał właśnie zakończoną aukcję.
     * Jeśli tak, przekierowuje do płatności.
     */
    const checkIfWinner = async (auctionId) => {
        try {
            const response = await fetch(`${API_URL}/api/auction-winner/${auctionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                alert("Congratulations! You won the auction!");
                window.location.href = `/auction-payment/${auctionId}`;
            } else {
                alert("The auction has ended.");
                loadAuction();
            }
        } catch (err) {
            console.error("Error checking winner:", err);
            loadAuction();
        }
    };

    /**
     * @function submitBid
     * @async
     * @description Przesyła nową ofertę cenową do systemu. 
     * Obsługuje walidację kwoty oraz blokuje przycisk na czas żądania.
     */
    const submitBid = async () => {
        if (!amount) return alert("Please enter a bid amount");

        const bidAmount = Number(amount);
        if (isNaN(bidAmount) || bidAmount <= auction.currentPrice) {
            return alert(`Your bid must be higher than ${auction.currentPrice} PLN`);
        }

        setLoadingBid(true);
        try {
            await placeBid(id, bidAmount);
            setAmount("");
        } catch (err) {
            alert("Failed to place bid. It might be too low or the auction has ended.");
        } finally {
            setLoadingBid(false);
        }
    };

    if (!auction) {
        return <div className="container mt-5"><p>Loading auction details...</p></div>;
    }

    const productName = auction.product?.name || auction.productName || "Unknown product";
    
    /** @brief Przygotowanie listy zdjęć z uwzględnieniem ścieżek bezwzględnych. */
    const images = auction.product?.imageUrls?.length > 0
        ? auction.product.imageUrls.map(url => url.startsWith("http") ? url : `${API_URL}${url}`)
        : [DEFAULT_IMAGE];

    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

    return (
        <div className="container my-4">
            <div className="row g-4">
                {/* Kolumna Lewa: Galeria Zdjęć */}
                <div className="col-lg-6">
                    <div className="position-relative">
                        <img
                            src={images[currentImageIndex]}
                            alt={productName}
                            className="img-fluid rounded shadow-sm w-100"
                            style={{ objectFit: "contain", maxHeight: "500px", backgroundColor: "#f8f9fa" }}
                            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                        />

                        {images.length > 1 && (
                            <>
                                <button className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm" onClick={prevImage}>◀</button>
                                <button className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm" onClick={nextImage}>▶</button>
                                <div className="d-flex justify-content-center gap-2 mt-3">
                                    {images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            className="rounded"
                                            style={{ 
                                                width: "60px", height: "60px", objectFit: "cover", 
                                                border: idx === currentImageIndex ? "3px solid #0d6efd" : "1px solid #dee2e6",
                                                cursor: "pointer", opacity: idx === currentImageIndex ? 1 : 0.6 
                                            }}
                                            onClick={() => setCurrentImageIndex(idx)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Kolumna Prawa: Informacje i Licytacja */}
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h2 className="card-title mb-3">{productName}</h2>

                            <div className="alert alert-primary d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <small className="text-muted d-block">Current bid</small>
                                    <h3 className="mb-0">{auction.currentPrice} PLN</h3>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted d-block">Time left</small>
                                    <strong className="text-danger">{timeLeft}</strong>
                                </div>
                            </div>

                            {currentWinner && (
                                <div className="alert alert-success mb-3">
                                    <small className="text-muted d-block">Currently leading</small>
                                    <strong>{currentWinner}</strong>
                                </div>
                            )}

                            {isAuthenticated ? (
                                <div className="mb-3">
                                    <label className="form-label">Your bid (PLN)</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder={`Min. ${auction.currentPrice + 1} PLN`}
                                        />
                                        <button className="btn btn-primary" onClick={submitBid} disabled={loadingBid}>
                                            {loadingBid ? "Placing bid..." : "Place bid"}
                                        </button>
                                    </div>
                                    <small className="text-muted">Minimum bid: {auction.currentPrice + 1} PLN</small>
                                </div>
                            ) : (
                                <div className="alert alert-warning">
                                    <Link to="/login" className="alert-link">Log in</Link> to participate in the auction
                                </div>
                            )}

                            {auction.product?.description && (
                                <div className="mt-4">
                                    <h5>Description</h5>
                                    <p className="text-muted">{auction.product.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}