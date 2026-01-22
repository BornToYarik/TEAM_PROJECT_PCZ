import { useNavigate } from "react-router-dom";
/**
 * @file FeaturedProductCard.jsx
 * @brief Komponent karty produktu wyroznionego (Featured Product).
 * @details Prezentuje kluczowe informacje o produkcie w powiekszonym formacie, 
 * z obsluga dynamicznych cen, etykiet promocyjnych oraz nawigacji.
 */

/**
 * @component FeaturedProductCard
 * @description Wyswietla atrakcyjna wizualnie karte produktu z efektem najechania (shadow-lg) 
 * i skalowaniem, dedykowana dla sekcji "Wyroznione" na stronie glownej.
 * @param {Object} props - Wlasciwosci komponentu.
 * @param {Object} props.product - Obiekt danych produktu (ID, nazwa, opis, ceny, znizki).
 */
function FeaturedProductCard({ product }) {
    const navigate = useNavigate();

    const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png";
    if (!product) return null;
    /**
     * @function isDiscountActive
     * @description Funkcja pomocnicza sprawdzajaca, czy produkt posiada obecnie aktywny rabat.
     * @param {Object} p - Obiekt produktu.
     * @returns {Boolean} Prawda, jesli promocja jest aktywna lub procent zni?ki jest wi?kszy od zera.
     */
    const isDiscountActive = (p) => p.hasActiveDiscount || p.discountPercentage > 0;

    const mainImage = (product.imageUrls && product.imageUrls.length > 0)
        ? product.imageUrls[0]
        : DEFAULT_IMAGE;

    return (
        <div className="featured-product-card col-12 col-md-6">
            <div
                className={`card h-100 shadow-lg p-3 product-card cursor-pointer 
                    ${isDiscountActive(product) ? "discount" : "no-discount"}`}

                style={{ transform: "scale(1.02)" }}
                onClick={() => navigate(`/product/${product.id}`)}
            >

                {isDiscountActive(product) && (
                    <span className="badge bg-danger position-absolute" style={{ top: 10, right: 10 }}>
                        -{product.discountPercentage}%
                    </span>
                )}

                <img
                    src={mainImage}
                    className="card-img-top"
                    style={{
                        objectFit: "contain",
                        height: "300px",
                        padding: "15px"
                    }}
                    alt={product.name}
                />

                <div className="card-body">
                    <h3 className="fw-bold">{product.name}</h3>

                    <p className="text-muted">
                        {product.description?.substring(0, 150)}
                    </p>

                    <div className="d-flex gap-3 align-items-end">
                        <p className="text-decoration-line-through text-muted mb-0">
                            {product.price} zl
                        </p>

                        <p className="fw-bold text-danger fs-3">
                            {product.finalPrice} zl
                        </p>
                    </div>

                    <button
                        className="btn w-100 mt-3 buy-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                        }}
                    >
                        View product
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FeaturedProductCard;
