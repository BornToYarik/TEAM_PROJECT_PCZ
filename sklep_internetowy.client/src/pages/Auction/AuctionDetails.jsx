import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuction, placeBid } from "../../api/auctionApi";
import { useAuth } from "../../auth/useAuth";
import * as signalR from "@microsoft/signalr";
import "./AuctionDetails.css";

export default function AuctionDetails() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const [auction, setAuction] = useState(null);
    const [amount, setAmount] = useState("");
    const [loadingBid, setLoadingBid] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [bids, setBids] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const connectionRef = useRef(null);
    const API_URL = "http://localhost:8080";
    const DEFAULT_IMAGE = "/placeholder.png";

    // -----------------------------
    // Load auction + SignalR
    // -----------------------------
    useEffect(() => {
        loadAuction();

        const token = localStorage.getItem("token");
        if (!token) return;

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

        connection.on("BidPlaced", (price, endTime) => {
            setAuction(prev => prev ? { ...prev, currentPrice: price, endTime } : prev);
            setBids(prev => [{
                bidder: "User",
                amount: price,
                time: new Date().toLocaleTimeString()
            }, ...prev]);
        });

        connection.on("AuctionFinished", () => {
            alert("Auction finished");
            loadAuction();
        });

        return () => {
            if (connectionRef.current) connectionRef.current.stop();
        };
    }, [id]);

    // -----------------------------
    // Timer
    // -----------------------------
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

    // -----------------------------
    // Load auction
    // -----------------------------
    const loadAuction = () => {
        

        getAuction(id)
            .then(res => setAuction(res.data))
            .catch(() => setAuction(null));
    };

    // -----------------------------
    // Submit bid
    // -----------------------------
    const submitBid = async () => {
        if (!amount) return alert("Enter bid amount");

        const bidAmount = Number(amount);
        if (isNaN(bidAmount) || bidAmount <= auction.currentPrice) {
            return alert(`Bid must be higher than $${auction.currentPrice}`);
        }

        setLoadingBid(true);
        try {
            await placeBid(id, bidAmount);
            setAmount("");
        } catch {
            alert("Failed to place bid");
        } finally {
            setLoadingBid(false);
        }
    };

    if (!auction) return <p>Loading auction...</p>;

    const productName = auction.product?.name || auction.productName || "Unknown product";

    // -----------------------------
    // Image gallery (same logic as ProductDetailsShop)
    // -----------------------------
    const images = auction.product?.imageUrls?.length > 0
        ? auction.product.imageUrls.map(url =>
            url.startsWith("http")
                ? url
                : `${API_URL}${url}`
        )
        : [DEFAULT_IMAGE];


    const nextImage = () =>
        setCurrentImageIndex(prev => (prev + 1) % images.length);

    const prevImage = () =>
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    console.log("Images:", images);
    console.log("Images raw:", auction.product?.images);

    // -----------------------------
    // Render
    // -----------------------------
    return (

        <div className="auction-page">
            <header className="auction-header">
                <nav>
                    <Link to="/">Catalog</Link>
                    <Link to="/auctions">Auctions</Link>
                </nav>
                <div className="user-info">
                    {isAuthenticated ? <span>👤 Profile</span> : <Link to="/login">Sign In</Link>}
                </div>
            </header>

            <div className="auction-container">
                <div className="product-card">
                    {/* ---------------- IMAGE GALLERY ---------------- */}
                    <div className="product-gallery position-relative text-center">
                        <img
                            src={images[currentImageIndex]}
                            alt={productName}
                            className="product-image img-fluid rounded shadow-sm"
                            style={{
                                objectFit: "contain",
                                width: "100%",
                                maxHeight: "500px",
                                backgroundColor: "#f8f9fa"
                            }}
                            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm"
                                    onClick={prevImage}
                                >
                                    ◀
                                </button>

                                <button
                                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm"
                                    onClick={nextImage}
                                >
                                    ▶
                                </button>

                                <div className="d-flex justify-content-center gap-2 mt-2">
                                    {images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover",
                                                border: idx === currentImageIndex ? "2px solid blue" : "1px solid #ccc",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            onError={(e) => { e.target.style.display = "none"; }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ---------------- PRODUCT INFO ---------------- */}
                    <div className="product-info">
                        <h1>{productName}</h1>
                        <div className="product-specs">
                            <span>🏷️ Brand: {auction.product?.brand || "N/A"}</span>
                            <span>💾 Storage: {auction.product?.storage || "N/A"}</span>
                            <span>✅ Condition: {auction.product?.condition || "New"}</span>
                            <span>🛡️ Warranty: {auction.product?.warranty || "1 year"}</span>
                        </div>
                    </div>
                </div>

                {/* ---------------- AUCTION BLOCK ---------------- */}
                <div className="auction-block">
                    <div className="current-bid">
                        <span className="label">🔥 Current Bid</span>
                        <span className="price">${auction.currentPrice}</span>
                    </div>

                    <div className="auction-stats">
                        <span>⏳ {timeLeft}</span>
                        <span>👥 {bids.length} bidders</span>
                        <span>💰 Min step: $1</span>
                    </div>

                    {isAuthenticated ? (
                        <div className="bid-controls">
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                min={auction.currentPrice + 1}
                            />
                            <button onClick={submitBid} disabled={loadingBid}>
                                {loadingBid ? "Placing..." : "Place Bid"}
                            </button>
                        </div>
                    ) : (
                        <p>Sign in to place a bid</p>
                    )}
                </div>

                {/* ---------------- DESCRIPTION ---------------- */}
                <div className="product-description">
                    <h3>Description</h3>
                    <p>{auction.product?.description || "No description"}</p>
                </div>
            </div>
        </div>

    );

}
