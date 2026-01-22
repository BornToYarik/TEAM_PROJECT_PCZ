import ProductGrid from "../../components/productGrid/ProductGrid";
import Carousel from "../../components/carousel/Carousel";

/**
 * @file Home.jsx
 * @brief Glowny komponent strony glownej aplikacji TechStore.
 * @details Modul odpowiada za wyswietlanie strony startowej, agregujac kluczowe elementy interfejsu 
 * takie jak karuzela promocyjna oraz siatka produktow.
 */

/**
 * @component Home
 * @description Renderuje uklad strony glownej. Wykorzystuje fragmenty React do zwrocenia 
 * komponentow Carousel oraz ProductGrid bez dodawania zbednych wezlow DOM.
 * @returns {JSX.Element} Widok strony glownej.
 */
function Home() {
    return (
        <>
            <Carousel />
            <ProductGrid />
        </>
    )
}

export default Home;