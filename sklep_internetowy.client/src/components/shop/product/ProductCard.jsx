import { useNavigate } from "react-router-dom";

function ProductCard({ product, addToCart, onClick }) {
    const navigate = useNavigate();
    const isDiscountActive = (p) => p.hasActiveDiscount || p.discountPercentage > 0;

    return (
        <div
            className={`card h-100 shadow-sm position-relative product-card cursor-pointer
                ${isDiscountActive(product) ? "discount" : "no-discount"}`}
            onClick={onClick}
        >

            {isDiscountActive(product) && (
                <span className="badge bg-danger position-absolute" style={{ top: 10, right: 10 }}>
                    -{product.discountPercentage}%
                </span>
            )}

            <img
                src="https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png"
                className="card-img-top"
                alt={product.name}
                style={{ objectFit: "cover", height: "200px" }}
            />

            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>

                <p className="text-muted small mb-1">
                    Category: <strong>{product.productCategory?.name || "None"}</strong>
                </p>

                <p className="card-text text-muted">
                    {product.description?.substring(0, 80) || "No description"}
                </p>

                <div className="mt-auto">
                    {isDiscountActive(product) ? (
                        <div>
                            <p className="text-decoration-line-through text-muted mb-0">
                                {product.price} zl
                            </p>
                            <p className="fw-bold text-danger fs-5">
                                {product.finalPrice} zl
                            </p>
                        </div>
                    ) : (
                        <p className="fw-bold text-success fs-5">{product.price} zl</p>
                    )}

                    <button
                        className="btn w-100 buy-btn"
                        disabled={product.quantity <= 0}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                            navigate("/cart");
                        }}
                    >
                        {product.quantity > 0 ? "Add to cart" : "Unavailable"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
