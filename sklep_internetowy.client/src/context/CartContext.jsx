import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @file CartContext.jsx
 * @brief Kontekst globalny koszyka zakupowego.
 * @details Odpowiada za przechowywanie produktow w koszyku, zapisywanie ich
 * do localStorage oraz udostepnianie funkcji zarzadzania koszykiem.
 */

/**
 * @brief Kontekst React przechowujacy dane koszyka.
 */
const CartContext = createContext();

/**
 * @brief Hook do latwego dostepu do kontekstu koszyka.
 * @return {Object} Aktualny kontekst koszyka.
 */
export const useCart = () => useContext(CartContext);

/**
 * @component CartProvider
 * @brief Provider kontekstu koszyka dla calej aplikacji.
 * @param {Object} children Komponenty potomne aplikacji.
 * @return JSX.Element Provider kontekstu koszyka.
 */
export const CartProvider = ({ children }) => {

    /**
     * @brief Stan przechowujacy produkty w koszyku.
     * @details Inicjalizowany danymi z localStorage jesli istnieja.
     */
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('shoppingCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    /**
     * @brief Zapisuje koszyk do localStorage przy kazdej zmianie.
     */
    useEffect(() => {
        localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    }, [cartItems]);

    /**
     * @brief Dodaje produkt do koszyka.
     * @param {Object} product Produkt do dodania.
     */
    const addToCart = (product) => {
        setCartItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === product.id);

            if (existingItem) {
                return currentItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...currentItems, { ...product, quantity: 1 }];
        });
        console.log("Added to cart:", product.name);
    };

    /**
     * @brief Usuwa produkt z koszyka.
     * @param {number|string} productId Identyfikator produktu.
     */
    const removeFromCart = (productId) => {
        setCartItems(currentItems => currentItems.filter(item => item.id !== productId));
    };

    /**
     * @brief Czysci caly koszyk.
     */
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('shoppingCart');
    };

    /**
     * @brief Aktualizuje ilosc produktu w koszyku.
     * @param {number|string} productId Identyfikator produktu.
     * @param {number} amount Zmiana ilosci (plus lub minus).
     */
    const updateQuantity = (productId, amount) => {
        setCartItems(currentItems =>
            currentItems.map(item => {
                if (item.id === productId) {
                    const newQty = Math.max(1, item.quantity + amount);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    /**
     * @brief Laczna wartosc koszyka.
     */
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    /**
     * @brief Laczna ilosc produktow w koszyku.
     */
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
};
