import { useState } from 'react';

/**
 * @file useComparison.js
 * @brief Hook React do zarzadzania stanem porownywarki produktow.
 * @details Modul umozliwia dodawanie, usuwanie oraz sprawdzanie obecnosci produktow w porownywarce. 
 * Implementuje logike kolejki (FIFO) przy osiagnieciu limitu produktow.
 */

/** @brief Maksymalna dopuszczalna liczba produktow w porownywarce. */
const MAX_PRODUCTS = 2;

/**
 * @function useComparison
 * @brief Glowny hook zarzadzajacy logika porownywania.
 * @returns {Object} Zestaw stanow i funkcji do obslugi listy porownawczej.
 */
export const useComparison = () => {
    /** @brief Stan przechowujacy tablice identyfikatorow (ID) produktow do porownania. */
    const [compareItems, setCompareItems] = useState([]);

    /**
     * @function addCompareItem
     * @brief Dodaje identyfikator produktu do listy.
     * @details Jesli lista zawiera juz maksymalna liczbe produktow, najstarszy element 
     * zostaje usuniety, a nowy dodany na koniec (zasada FIFO).
     * @param {number|string} productId - Unikalny identyfikator produktu.
     */
    const addCompareItem = (productId) => {
        if (compareItems.includes(productId)) {
            return;
        }

        if (compareItems.length >= MAX_PRODUCTS) {
            setCompareItems(prevItems => [...prevItems.slice(1), productId]);
        } else {
            setCompareItems(prevItems => [...prevItems, productId]);
        }
    };

    /**
     * @function removeCompareItem
     * @brief Usuwa wybrany produkt z listy porownawczej.
     * @param {number|string} productId - ID produktu do usuniecia.
     */
    const removeCompareItem = (productId) => {
        setCompareItems(prevItems => prevItems.filter(id => id !== productId));
    };

    /**
     * @function isCompared
     * @brief Sprawdza, czy dany produkt znajduje sie juz w porownywarce.
     * @param {number|string} productId - ID produktu do sprawdzenia.
     * @returns {boolean} True, jesli produkt jest na liscie; w przeciwnym razie False.
     */
    const isCompared = (productId) => {
        return compareItems.includes(productId);
    };

    return {
        /** @brief Aktualna lista ID produktow w porownywarce. */
        compareItems,
        addCompareItem,
        removeCompareItem,
        isCompared,
        /** @brief Flaga informujaca, czy osiagnieto limit produktow. */
        maxReached: compareItems.length >= MAX_PRODUCTS,
        MAX_PRODUCTS,
        /** @brief Funkcja czyszczaca cala zawartosc porownywarki. */
        clearComparison: () => setCompareItems([])
    };
};