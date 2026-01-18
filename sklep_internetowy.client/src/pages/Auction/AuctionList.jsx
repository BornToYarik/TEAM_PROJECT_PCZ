import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveAuctions } from "../../api/auctionApi";
import { isAdmin } from "../../utils/authUtils";
import './AuctionList.css';

export default function AuctionList() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

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

    const goToCreateAuction = () => {
        navigate("/admin/create-auction");
    };

    if (loading) return <div className="loading">Loading auctions...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="auction-list-page">
            <header className="page-header">
                <h1>🔥 Active Auctions</h1>
                {isAdmin() && (
                    <button
                        onClick={goToCreateAuction}
                        className="btn-create"
                    >
                        ➕ Create Auction
                    </button>
                )}
            </header>

            {auctions.length === 0 ? (
                <div className="empty-state">
                    <p>😔 No active auctions at the moment</p>
                </div>
            ) : (
                <div className="auction-grid">
                    {auctions.map(a => (
                        <div key={a.id} className="auction-card">
                            <div className="card-image">
                                <img
                                    src={a.product?.imageUrl || '/placeholder.png'}
                                    alt={a.product?.name}
                                />
                                <span className="badge-live">🔴 LIVE</span>
                            </div>

                            <div className="card-content">
                                <h3>{a.product?.name ?? `Product #${a.productId}`}</h3>

                                <div className="card-price">
                                    <span className="label">Current Bid</span>
                                    <span className="amount">${a.currentPrice}</span>
                                </div>

                                <div className="card-timer">
                                    <span className="icon">⏳</span>
                                    <span>
                                        {a.endTime
                                            ? new Date(a.endTime).toLocaleString('en-US')
                                            : "Unknown"}
                                    </span>
                                </div>

                                <Link to={`/auction/${a.id}`} className="btn-view">
                                    View Auction →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}