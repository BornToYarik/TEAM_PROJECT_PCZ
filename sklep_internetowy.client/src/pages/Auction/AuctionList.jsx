import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveAuctions } from "../../api/auctionApi";


export default function AuctionList() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const API_URL = "http://localhost:8080";

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
                <div>
                   
                    <button
                        onClick={() => navigate("/my-auction-wins")}
                        className="btn btn-primary"
                    >
                        My won auctions
                    </button>
                </div>
            </div>

            {auctions.length === 0 ? (
                <div className="alert alert-info text-center">
                    <p className="mb-0">No active auctions</p>
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
                                <div className="card h-100 shadow-sm">
                                    <div className="position-relative">
                                        <img
                                            src={imageUrl}
                                            alt={a.product?.name}
                                            className="card-img-top"
                                            style={{
                                                height: "250px",
                                                objectFit: "cover",
                                                backgroundColor: "#f8f9fa"
                                            }}
                                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                                        />
                                        <span
                                            className="badge bg-danger position-absolute top-0 end-0 m-2"
                                            style={{ fontSize: "0.8rem" }}
                                        >
                                            Live
                                        </span>
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">
                                            {a.product?.name ?? `Product #${a.productId}`}
                                        </h5>

                                        <div className="mb-2">
                                            <small className="text-muted d-block">Current bid</small>
                                            <h4 className="text-primary mb-0">{a.currentPrice} PLN</h4>
                                        </div>

                                        {a.currentWinnerName && (
                                            <div className="mb-2">
                                                <small className="text-muted">Leading bidder: </small>
                                                <strong className="text-success">
                                                    {a.currentWinnerName}
                                                </strong>
                                            </div>
                                        )}

                                        <div className="mb-3 text-muted small">
                                            <i className="bi bi-clock"></i>{" "}
                                            {getTimeRemaining(a.endTime)}
                                        </div>

                                        <Link
                                            to={`/auction/${a.id}`}
                                            className="btn btn-primary mt-auto"
                                        >
                                            View auction →
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
