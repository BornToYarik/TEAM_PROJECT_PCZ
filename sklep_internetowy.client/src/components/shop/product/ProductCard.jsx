import { useNavigate } from "react-router-dom";
import { useWishlist } from '../../../context/WishListContext';
import { useTranslation } from 'react-i18next';

function ProductCard({ product, addToCart, onClick }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isDiscountActive = (p) => p.hasActiveDiscount || p.discountPercentage > 0;
    const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png";

    const { toggleWishlist, isInWishlist } = useWishlist();
    const isLiked = isInWishlist(product.id);

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
                style={{ objectFit: "cover", height: "200px" }}
            />

            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>

                <p className="text-muted small mb-1">
                    {t('productCard.category')} <strong>{product.productCategory?.name || t('productCard.none')}</strong>
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