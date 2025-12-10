import { useEffect, useState, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

import ProductCard from "../shop/product/ProductCard";
import FeaturedProductCard from "../featuredProductCard/FeaturedProductCard";

function ProductGrid() {

    const [products, setProducts] = useState([]);
    const [featuredProduct, setFeaturedProduct] = useState(null); 

    const { addToCart } = useCart();
    const navigate = useNavigate();

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

    const filteredProducts = useMemo(() => {
        if (!featuredProduct) return products;
        return products.filter(p => p.id !== featuredProduct.id);
    }, [products, featuredProduct]);

    const handleProductClick = (id) => navigate(`/product/${id}`);

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

            <div className="row g-4">

                {featuredProduct && (
                    <FeaturedProductCard product={featuredProduct} />
                )}

                {filteredProducts.map((p) => (
                    <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <ProductCard
                            product={p}
                            addToCart={addToCart}
                            onClick={() => handleProductClick(p.id)}
                        />
                    </div>
                ))}

            </div>
        </div>
    );
}

export default ProductGrid;
