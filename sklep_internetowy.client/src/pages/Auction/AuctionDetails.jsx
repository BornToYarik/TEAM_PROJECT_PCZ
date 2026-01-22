import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getAuction, placeBid } from "../../api/auctionApi";
import { useAuth } from "../../auth/useAuth";
import * as signalR from "@microsoft/signalr";

/**
 * @file AuctionDetails.jsx
 * @brief Komponent widoku szczegolowego aukcji z obsluga licytacji w czasie rzeczywistym.
 * @details Modul integruje sie z SignalR w celu zapewnienia natychmiastowych aktualizacji ceny 
 * bez koniecznosci odswiezania strony. Obsluguje uwierzytelnianie JWT oraz walidacje ofert.
 */

/**
 * @component AuctionDetails
 * @description Wyswietla pelne dane aukcji, zarzadza cyklem zycia polaczenia SignalR 
 * oraz umozliwia zalogowanym uzytkownikom branie udzialu w licytacji.
 */
export default function AuctionDetails() {
    /** @brief Pobranie identyfikatora aukcji z parametrow sciezki URL. */
    const { id } = useParams();

    /** @brief Status autoryzacji uzytkownika pobrany z dedykowanego hooka. */
    const { isAuthenticated } = useAuth();

    /** @brief Stan przechowujacy szczegolowe informacje o aukcji (produkt, cena, czas). */
    const [auction, setAuction] = useState(null);

    /** @brief Wartosc nowej oferty licytacyjnej wpisana w formularzu. */
    const [amount, setAmount] = useState("");

    /** @brief Flaga kontrolujaca blokowanie interfejsu podczas wysylania oferty. */
    const [loadingBid, setLoadingBid] = useState(false);

    /** @brief Referencja do obiektu polaczenia SignalR zachowujaca stan miedzy renderami. */
    const connectionRef = useRef(null);

    /**
     * @effect Inicjalizacja komponentu i konfiguracja SignalR.
     * @details Pobiera dane poczatkowe aukcji i ustanawia polaczenie z Hubem aukcyjnym. 
     * Rejestruje handlery dla zdarzen "BidPlaced" oraz "AuctionFinished".
     */
    useEffect(() => {
        loadAuction();

        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);
        console.log("Token preview:", token?.substring(0, 50));

        if (!token) {
            console.warn("No token found - user must log in");
            return;
        }

        // Budowa polaczenia z adresem Hub-a na serwerze
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:8080/auctionHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        // Uruchomienie polaczenia i dolaczenie do grupy konkretnej aukcji
        connection.start()
            .then(() => {
                console.log("SignalR connected");
                return connection.invoke("JoinAuction", Number(id));
            })
            .catch(err => console.error("SignalR connection error:", err));

        /** @callback BidPlaced
         * @description Reaguje na powiadomienie o nowej najwyzszej ofercie od innego uzytkownika.
         */
        connection.on("BidPlaced", (price, endTime) => {
            setAuction(prev => prev ? { ...prev, currentPrice: price, endTime } : prev);
        });

        /** @callback AuctionFinished
         * @description Wyswietla powiadomienie o zakonczeniu licytacji i odswieza dane.
         */
        connection.on("AuctionFinished", () => {
            alert("Auction finished");
            loadAuction();
        });

        // Sprzatanie zasobow (zamykanie polaczenia) przy odmontowaniu komponentu
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop().catch(err => console.error("SignalR stop error:", err));
            }
        };
    }, [id]);

    /**
     * @function loadAuction
     * @description Pobiera aktualny stan aukcji z serwera za pomoca API REST.
     */
    const loadAuction = () => {
        getAuction(id)
            .then(res => setAuction(res.data || null))
            .catch(err => {
                console.error("Failed to load auction:", err);
                setAuction(null);
            });
    };

    /**
     * @function submitBid
     * @async
     * @description Przesyla nowa oferte cenowa do systemu. 
     * Obsluguje walidacje oraz wyswietla komunikaty o bledach (np. zbyt niska kwota).
     */
    const submitBid = async () => {
        if (!amount) return alert("Enter bid amount");
        setLoadingBid(true);
        try {
            await placeBid(id, Number(amount));
            setAmount("");
        } catch (err) {
            console.error("Bid error:", err);
            alert("Bid too low or auction finished");
        } finally {
            setLoadingBid(false);
        }
    };

    if (!auction) return <p>Loading auction...</p>;

    /** @brief Logika wyznaczania nazwy produktu z roznych zrodel danych DTO. */
    const productName = auction.product?.name || auction.productName || "Unknown product";

    return (
        <div>
            <h2>{productName}</h2>
            <p>Current price: {auction.currentPrice ?? "N/A"} USD</p>
            <p>Ends at: {auction.endTime ? new Date(auction.endTime).toLocaleString() : "N/A"}</p>

            {/* Sekcja licytacji widoczna tylko dla zalogowanych uzytkownikow */}
            {isAuthenticated ? (
                <>
                    <input
                        type="number"
                        placeholder="Your bid"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        min="0"
                    />
                    <button onClick={submitBid} disabled={loadingBid}>
                        {loadingBid ? "Placing bid..." : "Place Bid"}
                    </button>
                </>
            ) : (
                <p>Please log in to bid</p>
            )}
        </div>
    );
}