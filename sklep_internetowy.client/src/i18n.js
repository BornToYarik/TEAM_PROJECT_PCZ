import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationPL from './locales/pl/translation.json';

/**
 * @file i18n.js
 * @brief Modul konfiguracji tlumaczen i lokalizacji aplikacji TechStore.
 * @details Plik odpowiada za inicjalizacje biblioteki i18next, automatyczne wykrywanie jezyka 
 * uzytkownika oraz mapowanie plikow JSON z tlumaczeniami na wspierane kody jezykowe (PL, EN).
 */

/**
 * @brief Obiekt zasobow zawierajacy mapowanie kluczy jezykowych na zaimportowane pliki tlumaczen.
 * @details Struktura obejmuje jezyk angielski (en) oraz polski (pl).
 */
const resources = {
    en: {
        translation: translationEN
    },
    pl: {
        translation: translationPL
    }
};

/**
 * @description Inicjalizacja i konfiguracja i18next.
 * @use LanguageDetector - Wykrywa preferowany jezyk na podstawie ustawien przegladarki lub ciasteczek.
 * @use initReactI18next - Przekazuje instancje i18n do biblioteki react-i18next w celu obslugi hookow.
 */
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        /** @brief Jezyk domyslny, uzywany gdy tlumaczenie dla wybranego jezyka nie jest dostepne. */
        fallbackLng: 'pl',
        interpolation: {
            /** @brief Wylaczenie eskapowania wartosci (React domyslnie chroni przed atakami XSS). */
            escapeValue: false
        }
    });

export default i18n;