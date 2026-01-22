import { useEffect, useState, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

import ProductCard from "../shop/product/ProductCard";
import FeaturedProductCard from "../featuredProductCard/FeaturedProductCard";

/**
 * @file ProductGrid.jsx
 * @brief Komponent wyswietlajacy siatke produktow na stronie glownej.
 * @details Pobiera liste produktow z API, losuje jeden produkt promocyjny
 * oraz wyswietla pozostale produkty z podzialem na strony.
 */

/**
 * @component ProductGrid
 * @brief Glowny komponent siatki produktow.
 * @details Odpowiada za pobieranie danych, paginacje, wybor produktu promocyjnego
 * oraz obsluge klikniec w produkty.
 * @return JSX.Element Element siatki produktow.
 */
function ProductGrid() {

    /**
     * @brief Lista wszystkich produktow pobranych z API.
     */
    const [products, setProducts] = useState([]);

    /**
     * @brief Aktualnie wybrany produkt promocyjny.
     */
    const [featuredProduct, setFeaturedProduct] = useState(null);

    /**
     * @brief Numer aktualnej strony paginacji.
     */
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * @brief Liczba produktow wyswietlanych na jednej stronie.
     */
    const productsPerPage = 12;

    /**
     * @brief Funkcja dodajaca produkt do koszyka.
     */
    const { addToCart } = useCart();

    /**
     * @brief Hook do nawigacji pomiedzy stronami.
     */
    const navigate = useNavigate();

    /**
     * @brief Efekt pobierajacy produkty z API przy pierwszym renderze komponentu.
     * @details Po pobraniu danych losowany jest jeden produkt z aktywna znizka.
     */
    useEffect(() => {
        fetch("/api/home/Product")
            .then(res => res.json())
            .then(data => {
                setProducts(data);

                const discounted = data.filter(p => p.hasActiveDiscount || p.discountPercentage > 0);
                if (discounted.length > 0) {
                    const rand = discounted[Math.floor(Math.random() * discounted.length)];
                    setFeaturedProduct(rand);
                }
            });
    }, []);

    /**
     * @brief Lista produktow bez produktu promocyjnego.
     * @details Zapobiega wyswietlaniu produktu promocyjnego dwa razy.
     */
    const filteredProducts = useMemo(() => {
        if (!featuredProduct) return products;
        return products.filter(p => p.id !== featuredProduct.id);
    }, [products, featuredProduct]);

    /**
     * @brief Indeks ostatniego produktu na aktualnej stronie.
     */
    const indexOfLastProduct = currentPage * productsPerPage;

    /**
     * @brief Indeks pierwszego produktu na aktualnej stronie.
     */
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    /**
     * @brief Lista produktow wyswietlanych na aktualnej stronie.
     */
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    /**
     * @brief Calkowita liczba stron paginacji.
     */
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    /**
     * @brief Zmienia aktualna strone paginacji.
     * @param {number} pageNumber Numer strony do wyswietlenia.
     */
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * @brief Obsluguje klikniecie w produkt.
     * @param {number|string} id Identyfikator produktu.
     */
    const handleProductClick = (id) => navigate(`/product/${id}`);

    return (
        <div className="container my-5">

            <style>
                {`
                .product-card {
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .featured-product-card {
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .featured-product-card:hover {
                    transform: scale(1.03);
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

                .pagination-btn {
                    background: white;
                    border: 1px solid #ddd;
                    color: black;
                    padding: 8px 16px;
                    margin: 0 5px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pagination-btn:hover {
                    background-color: #f0f0f0;
                }
                .pagination-btn.active {
                    background-color: black;
                    color: white;
                    border-color: black;
                }
                .pagination-btn:disabled {
                    color: #ccc;
                    cursor: not-allowed;
                }

                .cursor-pointer { cursor: pointer; }
                `}
            </style>

            <div className="row g-4">

                {featuredProduct && (
                    <FeaturedProductCard product={featuredProduct} />
                )}

                {currentProducts.map((p) => (
                    <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <ProductCard
                            product={p}
                            addToCart={addToCart}
                            onClick={() => handleProductClick(p.id)}
                        />
                    </div>
                ))}

            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                    <button
                        className="pagination-btn"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &laquo; Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="pagination-btn"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next &raquo;
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductGrid;
