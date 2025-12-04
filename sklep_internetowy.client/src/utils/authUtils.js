// Ta funkcja dekoduje token JWT (Base64) na obiekt JSON, ¿ebyœmy mogli odczytaæ Role
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

// Ta funkcja sprawdza, czy u¿ytkownik ma rolê Admin
export const isAdmin = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decoded = parseJwt(token);
    if (!decoded) return false;

    // W ASP.NET Identity rola jest czêsto zapisywana pod tym d³ugim kluczem:
    const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    // Sprawdzamy czy rola to "Admin"
    return decoded[roleKey] === "Admin" || decoded.role === "Admin";
};