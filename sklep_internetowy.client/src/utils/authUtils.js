/**
 * @function parseJwt
 * @description Dekoduje token JWT (Base64) na obiekt JSON, umozliwiajac odczyt danych zawartych w payloadzie.
 * @param {string} token - Surowy ciag znakow tokenu JWT.
 * @returns {Object|null} Zdekodowany obiekt JSON lub null w przypadku bledu.
 */
export const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

/**
 * @function isAdmin
 * @description Sprawdza, czy aktualnie zalogowany uzytkownik posiada uprawnienia administratora.
 * @details Pobiera token z localStorage i weryfikuje obecnosc odpowiedniego roszczenia (claim) roli.
 * @returns {boolean} True, jesli uzytkownik jest administratorem; w przeciwnym razie False.
 */
export const isAdmin = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decoded = parseJwt(token);
    if (!decoded) return false;

    // Klucz roli charakterystyczny dla systemow ASP.NET Identity
    const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    return decoded[roleKey] === "Admin" || decoded.role === "Admin";
};