import Footer from "../../components/footer/Footer"
import ProductCard from "../../components/shop/product/ProductCard";

function Home() {
    return (
        <>
            <h2 className="text-center m-5">Home page</h2>
            <ProductCard />
            <Footer/>
        </>
    )
}

export default Home;