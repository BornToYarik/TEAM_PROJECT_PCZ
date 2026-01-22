/**
 * @file useAuth.js
 * @brief Hook Reactowy do zarzadzania stanem uwierzytelniania uzytkownika.
 */

/**
 * @function useAuth
 * @description Funkcja pomocnicza (helper) do sprawdzania stanu autoryzacji uzytkownika.
 * @details Pobiera token oraz role z magazynu lokalnego (localStorage) w celu weryfikacji uprawnien.
 * @returns {Object} Obiekt zawierajacy flagi logiczne: isAuthenticated (czy zalogowany) oraz isAdmin (czy posiada uprawnienia administratora).
 */
export const useAuth = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    return {
        isAuthenticated: !!token,
        isAdmin: role === "Admin"
    };
};
