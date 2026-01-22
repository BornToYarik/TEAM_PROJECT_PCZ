import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

/**
 * @file ProductDetailsShop.jsx
 * @brief Komponent wyswietlajacy szczegolowe informacje o produkcie w interfejsie sklepu.
 * @details Zarzadza pobieraniem danych o konkretnym towarze, interaktywna galeria zdjec 
 * oraz integracja z systemem koszyka i porownywarki produktow.
 */

/**
 * @component ProductDetailsShop
 * @description Renderuje widok szczegolowy produktu, umozliwiajac jego zakup lub dodanie do porownania.
 * @param {Object} props - Wlasciwosci komponentu.
 * @param {Object} props.comparison - Obiekt stanu i funkcji porownywarki przekazywany z komponentu nadrzednego.
 */
function ProductDetailsShop({ comparison }) {
    /** @brief Pobranie identyfikatora produktu z parametrow sciezki URL. */
    const { id } = useParams();
    /** @brief Stan przechowujacy dane pobranego produktu. */
    const [product, setProduct] = useState(null);
    /** @brief Flaga kontrolujaca wyswietlanie stanu ladowania danych. */
    const [loading, setLoading] = useState(true);
    /** @brief Hook zapewniajacy dostep do funkcji dodawania do koszyka. */
    const { addToCart } = useCart();
    /** @brief Hook umozliwiajacy nawigacje wsteczna lub przekierowania. */
    const navigate = useNavigate();
    /** @brief Indeks aktualnie wyswietlanego zdjecia w galerii produktu. */
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    /** @brief Adres domyslnego obrazu uzywanego w przypadku braku grafik produktu. */
    const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png";

    /**
     * @effect Pobieranie szczegolow produktu.
     * @description Inicjuje zapytanie API po zamontowaniu komponentu lub zmianie ID produktu.
     */
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

    /** @brief Sprawdzenie czy produkt znajduje sie juz w porownywarce. */
    const isCompared = (comparison) ? comparison.isCompared(product.id) : false;
    /** @brief Sprawdzenie czy osiagnieto limit produktow w porownywarce (blokada przycisku). */
    const maxReached = (comparison) ? comparison.maxReached && !isCompared : false;

    /** @brief Tablica zdjec produktu lub zestaw z obrazem domyslnym. */
    const images = (product.imageUrls && product.imageUrls.length > 0)
        ? product.imageUrls
        : [DEFAULT_IMAGE];

    /**
     * @function nextImage
     * @description Przelacza wyswietlane zdjecie na nastepne w kolejnosci.
     */
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    /**
     * @function prevImage
     * @description Przelacza wyswietlane zdjecie na poprzednie.
     */
    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    /**
     * @function handleCompareToggle
     * @description Przelacza obecnosc produktu na liscie do porownania.
     */
    const handleCompareToggle = () => {
        if (!comparison) {
            console.warn("Brak propsa comparison.");
            return;
        }
        if (isCompared) {
            comparison.removeCompareItem(product.id);
        } else {
            comparison.addCompareItem(product.id);
        }
    };

    /** @brief Flaga informujaca o aktywnym rabacie na produkt. */
    const isDiscountActive = product.hasActiveDiscount || product.discountPercentage > 0;

    return (
        <div className="container my-5">
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                Back to shop
            </button>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="position-relative text-center">
                        <img
                            src={images[currentImageIndex]}
                            alt={product.name}
                            className="img-fluid rounded shadow-sm"
                            style={{ objectFit: "contain", width: "100%", maxHeight: "500px", backgroundColor: "#f8f9fa" }}
                            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm"
                                    onClick={prevImage}
                                    style={{ border: "2px solid black" }}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                <button
                                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm"
                                    onClick={nextImage}
                                    style={{ border: "2px solid black" }}
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>

                                <div className="d-flex justify-content-center gap-2 mt-2">
                                    {images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover",
                                                border: idx === currentImageIndex ? "2px solid blue" : "1px solid #ccc",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
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

                        {comparison && (
                            <button
                                className={`btn flex-shrink-0 ${isCompared ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={handleCompareToggle}
                                disabled={maxReached}
                                title={maxReached ? "Maximum 2 products for comparison" : ""}
                            >
                                <i className={`bi-shuffle me-1`}></i>
                                {isCompared ? "Remove from Compare" : "Add to Compare"}
                                {maxReached && " (Max 2)"}
                            </button>
                        )}
                    </div>
                    <p className="mt-3 text-muted small">Pieces available: {product.quantity}</p>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailsShop;