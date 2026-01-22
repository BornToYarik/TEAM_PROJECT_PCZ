import { useNavigate } from "react-router-dom";
import { useWishlist } from '../../../context/WishListContext';
import { useTranslation } from 'react-i18next';

/**
 * @file ProductCard.jsx
 * @brief Komponent karty produktu wyswietlanej w siatce produktow.
 * @details Odpowiada za prezentacje pojedynczego produktu, wyswietlanie ceny,
 * obsluge znizek, dodawanie do koszyka oraz zarzadzanie lista zyczen.
 */

/**
 * @component ProductCard
 * @brief Komponent pojedynczej karty produktu.
 * @param {Object} product Obiekt produktu do wyswietlenia.
 * @param {Function} addToCart Funkcja dodajaca produkt do koszyka.
 * @param {Function} onClick Funkcja wywolywana po kliknieciu w karte produktu.
 * @return JSX.Element Element karty produktu.
 */
function ProductCard({ product, addToCart, onClick }) {

    /**
     * @brief Funkcja tlumaczen interfejsu uzytkownika.
     */
    const { t } = useTranslation();

    /**
     * @brief Hook do nawigacji pomiedzy stronami.
     */
    const navigate = useNavigate();

    /**
     * @brief Sprawdza czy produkt ma aktywna znizke.
     * @param {Object} p Obiekt produktu.
     * @return {boolean} True jesli znizka jest aktywna.
     */
    const isDiscountActive = (p) => p.hasActiveDiscount || p.discountPercentage > 0;

    /**
     * @brief Domyslny obrazek produktu uzywany gdy brak zdjec.
     */
    const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png";

    /**
     * @brief Funkcje oraz dane z kontekstu listy zyczen.
     */
    const { toggleWishlist, isInWishlist } = useWishlist();

    /**
     * @brief Flaga informujaca czy produkt znajduje sie w liscie zyczen.
     */
    const isLiked = isInWishlist(product.id);

    /**
     * @brief Glowny obrazek produktu.
     */
    const mainImage = (product.imageUrls && product.imageUrls.length > 0)
        ? product.imageUrls[0]
        : DEFAULT_IMAGE;

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
                src={mainImage}
                className="card-img-top"
                alt={product.name}
                style={{
                    objectFit: "contain",
                    height: "200px",
                    width: "100%",
                    padding: "15px"
                }}
            />

            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>

                <p className="text-muted small mb-1">
                    {t('productCard.category')} <strong>{product.productCategoryName || t('productCard.none')}</strong>
                </p>

                <p className="card-text text-muted">
                    {product.description?.substring(0, 80) || t('productCard.noDescription')}
                </p>

                <div className="mt-auto">
                    {isDiscountActive(product) ? (
                        <div>
                            <p className="text-decoration-line-through text-muted mb-0">
                                {product.price} {t('productCard.currency')}
                            </p>
                            <p className="fw-bold text-danger fs-5">
                                {product.finalPrice} {t('productCard.currency')}
                            </p>
                        </div>
                    ) : (
                        <p className="fw-bold text-success fs-5">
                            {product.price} {t('productCard.currency')}
                        </p>
                    )}

                    <button
                        className="btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                        style={{
                            backgroundColor: 'white',
                            width: '35px',
                            height: '35px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                        }}
                    >
                        {isLiked ? (
                            <i className="bi bi-heart-fill text-danger"></i>
                        ) : (
                            <i className="bi bi-heart text-secondary"></i>
                        )}
                    </button>

                    <button
                        className="btn w-100 buy-btn"
                        disabled={product.quantity <= 0}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                            navigate("/cart");
                        }}
                    >
                        {product.quantity > 0 ? t('productCard.addToCart') : t('productCard.unavailable')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
