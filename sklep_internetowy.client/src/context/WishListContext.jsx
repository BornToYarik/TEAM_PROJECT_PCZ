import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @file WishlistContext.jsx
 * @brief Kontekst React do zarzadzania lista zyczen (ulubionymi produktami).
 * @details Umozliwia dodawanie i usuwanie produktow z listy oraz ich trwale przechowywanie w pamieci lokalnej przegladarki (localStorage).
 */

/** @brief Obiekt kontekstu dla listy zyczen. */
const WishlistContext = createContext();

/**
 * @function useWishlist
 * @brief Hook zapewniajacy dostep do danych i metod listy zyczen.
 * @returns {Object} Zawiera tablice wishlist, funkcje toggleWishlist oraz isInWishlist.
 */
export const useWishlist = () => useContext(WishlistContext);

/**
 * @component WishlistProvider
 * @brief Komponent dostawcy, ktory opakowuje aplikacje i zarzadza stanem listy zyczen.
 * @param {Object} props - Wlasciwosci komponentu, w tym dzieci (children).
 */
export const WishlistProvider = ({ children }) => {
    /** @brief Stan przechowujacy liste produktow, inicjalizowany z localStorage. */
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem("wishlist");
        return saved ? JSON.parse(saved) : [];
    });

    /** @brief Synchronizacja stanu listy zyczen z localStorage przy kazdej zmianie kolekcji. */
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    /**
     * @function toggleWishlist
     * @brief Przelacza obecnosc produktu na liscie: dodaje go lub usuwa, jesli juz istnieje.
     * @param {Object} product - Pelny obiekt produktu do przetworzenia.
     */
    const toggleWishlist = (product) => {
        const isExists = wishlist.some(p => p.id === product.id);

        if (isExists) {
            setWishlist(prev => prev.filter(p => p.id !== product.id));
        } else {
            setWishlist(prev => [...prev, product]);
        }
    };

    /**
     * @function isInWishlist
     * @brief Sprawdza, czy produkt o podanym identyfikatorze znajduje sie obecnie na liscie zyczen.
     * @param {number|string} productId - Unikalny identyfikator produktu.
     * @returns {boolean} True, jesli produkt jest na liscie; w przeciwnym razie False.
     */
    const isInWishlist = (productId) => wishlist.some(p => p.id === productId);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};