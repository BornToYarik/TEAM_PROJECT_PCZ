import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import './i18n';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishListContext';
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