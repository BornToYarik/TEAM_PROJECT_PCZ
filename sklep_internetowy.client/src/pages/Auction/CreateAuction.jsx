import { useEffect, useState } from "react";
import { createAuction } from "../../api/auctionApi";
import axios from "axios";
import { isAdmin } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom";

export default function CreateAuction() {
    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("1"); // default: 1 minute
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/home/Product")
            .then(res => setProducts(res.data || []))
            .catch(err => console.error("Products error:", err));
    }, []);

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
            navigate("/"); // go back to auction list
        } catch (err) {
            console.error(err);
            alert("Failed to create auction");
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin()) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Access denied</div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">Create Auction</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="product" className="form-label">
                                        Product
                                    </label>
                                    <select
                                        id="product"
                                        className="form-select"
                                        value={productId}
                                        onChange={e => setProductId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select product</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name || "Unnamed product"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="price" className="form-label">
                                        Starting price (PLN)
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="duration" className="form-label">
                                        Auction duration
                                    </label>
                                    <select
                                        id="duration"
                                        className="form-select"
                                        value={duration}
                                        onChange={e => setDuration(e.target.value)}
                                        required
                                    >
                                        <option value="1">1 minute</option>
                                        <option value="10">10 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                        <option value="180">3 hours</option>
                                        <option value="360">6 hours</option>
                                        <option value="720">12 hours</option>
                                        <option value="1440">24 hours</option>
                                        <option value="2880">2 days</option>
                                        <option value="4320">3 days</option>
                                        <option value="10080">7 days</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Creating...
                                        </>
                                    ) : (
                                        "Create auction"
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
