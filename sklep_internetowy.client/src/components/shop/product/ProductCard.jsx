import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext"; 

function ProductCard() {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart(); 

    useEffect(() => {
        fetch("/api/home/Product")
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) =>
                console.error("Blad przy pobieraniu produktow:", err)
            );
    }, []);

    return (
        <div className="container my-5">
            <div className="row g-4">
                {products.map((p) => (
                    <div key={p.id} className="col-12 col-sm-6 col-md-4">
                        <div className="card h-100 shadow-sm">
                            {/* Photo */}
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{p.name}</h5>
                                <p className="card-text text-muted">
                                    {p.description || "Brak opisu"}
                                </p>
                                <div className="mt-auto">
                                    <p className="fw-bold text-success fs-5">
                                        {p.price} zl
                                    </p>
                                    {/**/}
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={() => addToCart(p)}
                                    >
                                        Add to Cart
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