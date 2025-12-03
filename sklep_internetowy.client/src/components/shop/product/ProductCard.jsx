import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";

function ProductCard() {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/home/Product")
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) => console.error("Error while loading products:", err));
    }, []);

    const isDiscountActive = (p) => p.hasActiveDiscount || p.discountPercentage > 0;

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    return (
        <div className="container my-5">

            <style>
             {`
            .product-card {
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .no-discount {
                border-color: #ccc !important;
            }

            .discount {
                border-color: #d9534f !important;
            }

            .product-card:hover {
                transform: scale(1.03);
                box-shadow: 0 0 0 4px currentColor;
            }

            .buy-btn {
                transition: background 0.3s ease, color 0.3s ease;
                background: black;
                color: white;
            }

            .buy-btn:hover {
                background: #28a745 !important;
                color: white;
            }
            .cursor-pointer { cursor: pointer; }
            `}
            </style>

            <div className="row g-4" >
                {products.map((p) => (
                    <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div
                            onClick={() => handleProductClick(p.id)}
                            className={`card h-100 shadow-sm position-relative product-card cursor-pointer ${isDiscountActive(p) ? "discount" : "no-discount"
                                }`}
                        >
                            {isDiscountActive(p) && (
                                <span
                                    className="badge bg-danger position-absolute"
                                    style={{ top: "10px", right: "10px" }}
                                >
                                    -{p.discountPercentage}%
                                </span>
                            )}

                            <img
                                src="https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png"
                                className="card-img-top"
                                alt={p.name}
                                style={{ objectFit: "cover", height: "200px" }}
                                
                            />

                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title"
                                    >{p.name}</h5>

                                <p className="text-muted small mb-1">
                                    Category: <strong>{p.productCategory?.name || "None"}</strong>
                                </p>

                                <p className="card-text text-muted">
                                    {p.description?.substring(0, 80) || "No description"}
                                </p>

                                <div className="mt-auto">
                                    {isDiscountActive(p) ? (
                                        <div>
                                            <p className="text-decoration-line-through text-muted mb-0">
                                                {p.price} zl
                                            </p>
                                            <p className="fw-bold text-danger fs-5">
                                                {p.finalPrice} zl
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="fw-bold text-success fs-5">
                                            {p.price} zl
                                        </p>
                                    )}

                                    <p
                                        className={`mb-2 ${p.quantity > 0 ? "text-success" : "text-danger"
                                            }`}
                                    >
                                        {p.quantity > 0
                                            ? `Pieces available: ${p.quantity}`
                                            : "Out of stock"}
                                    </p>

                                    <button
                                        className="btn w-100 buy-btn"
                                        disabled={p.quantity <= 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(p);
                                            navigate("/cart");
                                        }}
                                    >
                                        {p.quantity > 0 ? "Add to cart" : "Unavailable"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductCard;
