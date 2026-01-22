import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import './i18n';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishListContext';

/**
 * @file main.jsx
 * @brief Glowny punkt wejscia (entry point) aplikacji TechStore.
 * @details Plik odpowiada za zainicjowanie drzewa komponentow React, konfiguracje 
 * mechanizmu Suspense dla asynchronicznego ladowania tlumaczen oraz rejestracje 
 * dostawcow kontekstu (Context Providers) dla koszyka, listy zyczen i routingu.
 */

/**
 * @description Inicjalizacja procesu renderowania aplikacji w elemencie DOM o identyfikatorze 'root'.
 * @use StrictMode - Narzedzie do wykrywania potencjalnych problemow w aplikacji podczas biezacego tworzenia.
 * @use Suspense - Zapewnia wyswietlanie stanu ladowania (fallback) podczas inicjalizacji zasobow i18next.
 * @use BrowserRouter - Kontener umozliwiajacy obsluge dynamicznych sciezek URL i nawigacji.
 * @use CartProvider - Dostawca stanu globalnego zarzadzajacy koszykiem zakupowym.
 * @use WishlistProvider - Dostawca stanu globalnego zarzadzajacy lista ulubionych produktow.
 */
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Suspense fallback={<div>Loading...</div>}>
            <BrowserRouter>
                <CartProvider>
                    <WishlistProvider>
                        <App />
                    </WishlistProvider>
                </CartProvider>
            </BrowserRouter>
        </Suspense>
    </StrictMode>,
)