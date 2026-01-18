import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });

    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('app-font-size') || 'normal'; 
    });

    useEffect(() => {
        const root = document.documentElement;


        root.setAttribute('data-theme', theme);
        root.setAttribute('data-bs-theme', theme); 
        localStorage.setItem('app-theme', theme);

        if (fontSize === 'large') {
            root.classList.add('font-large');
        } else {
            root.classList.remove('font-large');
        }
        localStorage.setItem('app-font-size', fontSize);

    }, [theme, fontSize]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleFontSize = () => {
        setFontSize(prev => prev === 'normal' ? 'large' : 'normal');
    };

    return (
        <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, toggleFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
};