import { useEffect, useState } from "react";
import { createAuction } from "../../api/auctionApi";
import axios from "axios";
import { isAdmin } from "../../utils/authUtils";
import './CreateAuction.css';

export default function CreateAuction() {
    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get("/api/home/Product")
            .then(res => setProducts(res.data || []))
            .catch(err => console.error("Products error:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productId || !price) {
            alert("Select product and price");
            return;
        }

        setLoading(true);
        try {
            await createAuction({
                productId: Number(productId),
                startingPrice: Number(price)
            });

            alert("Auction created successfully");
            setProductId("");
            setPrice("");
        } catch (err) {
            console.error(err);
            alert("Failed to create auction");
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin()) {
        return <div className="access-denied">🚫 Access Denied</div>;
    }

    return (
        <div className="create-auction-page">
            <form onSubmit={handleSubmit} className="create-form">
                <h1>➕ Create Auction</h1>

                <div className="form-group">
                    <label htmlFor="product">Product</label>
                    <select
                        id="product"
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

                <div className="form-group">
                    <label htmlFor="price">Starting Price ($)</label>
                    <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00"
                        required
                    />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? "⏳ Creating..." : "🚀 Create"}
                </button>
            </form>
        </div>
    );
}