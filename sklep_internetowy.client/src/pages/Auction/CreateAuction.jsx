import { useEffect, useState } from "react";
import { createAuction } from "../../api/auctionApi";
import axios from "axios";
import { isAdmin } from "../../utils/authUtils";

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
        return <p>Access denied</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Create Auction</h1>

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

            <label htmlFor="price">Starting price</label>
            <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
            </button>
        </form>
    );
}
