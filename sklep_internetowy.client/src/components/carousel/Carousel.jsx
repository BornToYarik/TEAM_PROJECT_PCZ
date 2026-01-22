import React from 'react';
/**
 * @file Carousel.jsx
 * @brief Komponent karuzeli obrazow wykorzystujacy biblioteke Bootstrap.
 * @details Komponent renderuje pelnowymiarowy baner z funkcja automatycznego przewijania, 
 * zoptymalizowany pod katem stalej wysokosci i responsywnego wypelnienia obrazem.
 */

/**
 * @component Carousel
 * @description Wyswietla interaktywny suwak obrazow (carousel) z kontrolkami nawigacji.
 * Wykorzystuje klasy Bootstrapa (data-bs-ride="carousel") do zapewnienia animacji.
 */
function Carosuel() {
    return (
        <>
            {/* @section Styles
              Definicja stylow lokalnych dla karuzeli.
              - .full-width-carousel-fixed-height: Zapewnia stala wysokosc 450px dla wszystkich slajdow.
              - object-fit: cover: Gwarantuje, ze zdjecia wypelnia przestrzen bez znieksztalcen proporcji.
            */}
            <style type="text/css">{`
                .full-width-carousel-fixed-height .carousel-item {
                    height: 450px;
                }
                .full-width-carousel-fixed-height .carousel-item img {
                    height: 100%;
                    width: 100%;
                    object-fit: cover;
                }
            `}</style>

            <div className="w-100">
                <div id="carouselAutoplaying" className="carousel slide" data-bs-ride="carousel">

                    <div className="carousel-inner full-width-carousel-fixed-height">

                        <div className="carousel-item active">
                            <img src="https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="d-block w-100" alt="..." />
                        </div>
                        <div className="carousel-item">
                            <img src="https://images.unsplash.com/photo-1672413514634-4781b15fd89e?q=80&w=1474&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="d-block w-100" alt="..." />
                        </div>
                        <div className="carousel-item">
                            <img src="https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="d-block w-100" alt="..." />
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselAutoplaying" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselAutoplaying" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Carosuel;