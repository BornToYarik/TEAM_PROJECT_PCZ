import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveAuctions } from "../../api/auctionApi";
import { isAdmin } from "../../utils/authUtils";

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

    if (loading) return <p>Loading auctions...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Active Auctions</h1>

            {isAdmin() && (
                <button
                    onClick={goToCreateAuction}
                    className="btn btn-warning"
                    style={{ marginBottom: 20 }}
                >
                    Create New Auction
                </button>
            )}

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

                        <Link to={`/auction/${a.id}`}>View Bids</Link>
                    </div>
                ))
            )}
        </div>
    );
}
