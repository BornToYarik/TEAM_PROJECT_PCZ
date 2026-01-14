import { useState } from 'react';

const MAX_PRODUCTS = 2;

export const useComparison = () => {
    const [compareItems, setCompareItems] = useState([]);

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

    const removeCompareItem = (productId) => {
        setCompareItems(prevItems => prevItems.filter(id => id !== productId));
    };

    const isCompared = (productId) => {
        return compareItems.includes(productId);
    };

    return {
        compareItems,
        addCompareItem,
        removeCompareItem,
        isCompared,
        maxReached: compareItems.length >= MAX_PRODUCTS,
        MAX_PRODUCTS,
        clearComparison: () => setCompareItems([])
    };
};