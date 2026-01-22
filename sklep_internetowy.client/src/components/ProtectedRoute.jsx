import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/authUtils";

/**
 * @file ProtectedRoute.jsx
 * @brief Komponent chroniacy trasy dostepne tylko dla administratora.
 * @details Sprawdza czy aktualny uzytkownik posiada uprawnienia administratora.
 * Jesli nie, przekierowuje go na strone glowna.
 */

/**
 * @component ProtectedRoute
 * @brief Komponent ochrony tras dla administratora.
 * @param {Object} children Komponenty potomne do wyrenderowania.
 * @return JSX.Element Chroniony komponent lub przekierowanie.
 */
const ProtectedRoute = ({ children }) => {

    /**
     * @brief Sprawdza czy aktualny uzytkownik jest administratorem.
     */
    const isUserAdmin = isAdmin();

    /**
     * @brief Jesli uzytkownik nie jest administratorem, nastapi przekierowanie na strone glowna.
     */
    if (!isUserAdmin) {
        return <Navigate to="/" replace />;
    }

    /**
     * @brief Zwraca chroniona zawartosc jesli uzytkownik ma uprawnienia.
     */
    return children;
};

export default ProtectedRoute;
