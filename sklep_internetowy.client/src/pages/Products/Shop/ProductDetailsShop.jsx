import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

function ProductDetailsShop() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/api/home/Product/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="container my-5">Loading...</div>;
    if (!product) return <div className="container my-5">Product not found.</div>;

    const isDiscountActive = product.hasActiveDiscount || product.discountPercentage > 0;

    return (
        <div className="container my-5">
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                Back to shop
            </button>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <img
                        src="https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png"
                        alt={product.name}
                        className="img-fluid rounded shadow-sm"
                        style={{ objectFit: "cover", width: "100%", maxHeight: "500px" }}
                    />
                </div>

                <div className="col-md-6">
                    <h1 className="display-5 fw-bolder">{product.name}</h1>
                    <div className="fs-5 mb-3">
                        <span className="text-muted text-decoration-line-through me-2">
                            {isDiscountActive ? `${product.price} zl` : ""}
                        </span>
                        <span className={isDiscountActive ? "text-danger fw-bold" : "text-success fw-bold"}>
                            {product.finalPrice} zl
                        </span>
                    </div>

                    <p className="lead">{product.description}</p>

                    <div className="d-flex">
                        <button
                            className="btn btn-dark flex-shrink-0 me-3"
                            type="button"
                            disabled={product.quantity <= 0}
                            onClick={() => {
                                addToCart(product);
                                navigate("/cart")
                            }}
                        >
                            <i className="bi-cart-fill me-1"></i>
                            {product.quantity > 0 ? "Add to cart" : "Product unavailable"}
                        </button>
                    </div>
                    <p className="mt-3 text-muted small">Pieces available: {product.quantity}</p>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailsShop;