import React, { createContext, useState, useEffect, useContext } from 'react';

/**
 * @file ThemeContext.jsx
 * @brief Kontekst globalny do zarzadzania motywem oraz rozmiarem czcionki aplikacji.
 * @details Pozwala przelaczac miedzy trybem jasnym i ciemnym oraz zmieniac rozmiar czcionki.
 * Ustawienia sa zapisywane w localStorage.
 */

/**
 * @brief Kontekst React przechowujacy ustawienia wygladu aplikacji.
 */
const ThemeContext = createContext();

/**
 * @brief Hook do pobierania kontekstu motywu aplikacji.
 * @return {Object} Aktualny kontekst motywu.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

/**
 * @component ThemeProvider
 * @brief Provider kontekstu motywu i rozmiaru czcionki dla calej aplikacji.
 * @param {Object} children Komponenty potomne.
 * @return JSX.Element Provider kontekstu motywu.
 */
export const ThemeProvider = ({ children }) => {

    /**
     * @brief Aktualny motyw aplikacji (light lub dark).
     * @details Wartosc inicjalizowana z localStorage.
     */
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });

    /**
     * @brief Aktualny rozmiar czcionki aplikacji (normal lub large).
     * @details Wartosc inicjalizowana z localStorage.
     */
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('app-font-size') || 'normal';
    });

    /**
     * @brief Efekt aktualizujacy atrybuty HTML oraz localStorage po zmianie ustawien.
     */
    useEffect(() => {
        const root = document.documentElement;

        // Ustawienie atrybutow motywu
        root.setAttribute('data-theme', theme);
        root.setAttribute('data-bs-theme', theme);
        localStorage.setItem('app-theme', theme);

        // Ustawienie klasy rozmiaru czcionki
        if (fontSize === 'large') {
            root.classList.add('font-large');
        } else {
            root.classList.remove('font-large');
        }
        localStorage.setItem('app-font-size', fontSize);

    }, [theme, fontSize]);

    /**
     * @brief Przelacza motyw miedzy light i dark.
     */
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    /**
     * @brief Przelacza rozmiar czcionki miedzy normal i large.
     */
    const toggleFontSize = () => {
        setFontSize(prev => prev === 'normal' ? 'large' : 'normal');
    };

    return (
        <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, toggleFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
};
