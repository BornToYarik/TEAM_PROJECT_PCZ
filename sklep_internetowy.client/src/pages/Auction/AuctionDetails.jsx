import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getAuction, placeBid } from "../../api/auctionApi";
import { useAuth } from "../../auth/useAuth";
import * as signalR from "@microsoft/signalr";

export default function AuctionDetails() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const [auction, setAuction] = useState(null);
    const [amount, setAmount] = useState("");
    const [loadingBid, setLoadingBid] = useState(false);
    const connectionRef = useRef(null);

    useEffect(() => {
        loadAuction();

        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);
        console.log("Token preview:", token?.substring(0, 50));

        if (!token) {
            console.warn("No token found - user must log in");
            return;
        }

        
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:8080/auctionHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.start()
            .then(() => {
                console.log("SignalR connected");
                return connection.invoke("JoinAuction", Number(id));
            })
            .catch(err => console.error("SignalR connection error:", err));

        connection.on("BidPlaced", (price, endTime) => {
            setAuction(prev => prev ? { ...prev, currentPrice: price, endTime } : prev);
        });

        connection.on("AuctionFinished", () => {
            alert("Auction finished");
            loadAuction();
        });

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop().catch(err => console.error("SignalR stop error:", err));
            }
        };
    }, [id]);

    const loadAuction = () => {
        getAuction(id)
            .then(res => setAuction(res.data || null))
            .catch(err => {
                console.error("Failed to load auction:", err);
                setAuction(null);
            });
    };

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

    const productName = auction.product?.name || auction.productName || "Unknown product";

    return (
        <div>
            <h2>{productName}</h2>
            <p>Current price: {auction.currentPrice ?? "N/A"} USD</p>
            <p>Ends at: {auction.endTime ? new Date(auction.endTime).toLocaleString() : "N/A"}</p>
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