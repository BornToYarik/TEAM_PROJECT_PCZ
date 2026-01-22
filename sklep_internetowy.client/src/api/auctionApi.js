/**
 * @file auctionApi.js
 * @brief Serwis kliencki do obsługi zapytań API związanych z systemem aukcyjnym.
 * @details Zawiera zestaw funkcji asynchronicznych do komunikacji z kontrolerem BidController,
 * obsługując pobieranie danych aukcji, licytowanie oraz tworzenie nowych licytacji.
 */

/**
 * @function getHeaders
 * @description Funkcja pomocnicza generująca nagłówki zapytań HTTP, w tym token autoryzacyjny Bearer.
 * @param {Object} customHeaders - Dodatkowe specyficzne nagłówki (np. Content-Type).
 * @returns {Object} Zestaw nagłówków z dołączonym tokenem JWT z localStorage.
 */
const getHeaders = (customHeaders = {}) => {
    const token = localStorage.getItem("token");
    const headers = { ...customHeaders };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * @function getActiveAuctions
 * @async
 * @description Pobiera listę wszystkich obecnie aktywnych (trwających) aukcji.
 * @returns {Promise<Array>} Obietnica zwracająca tablicę obiektów AuctionDto.
 * @throws {Error} Gdy serwer zwróci błąd podczas pobierania.
 */
export const getActiveAuctions = async () => {
    const response = await fetch("/api/bid/active", {
        method: "GET",
        headers: getHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch active auctions");
    try {
        return await response.json();
    } catch {
        return [];
    }
};

/**
 * @function getAuction
 * @async
 * @description Pobiera szczegółowe dane konkretnej aukcji na podstawie jej identyfikatora.
 * @param {number|string} id - Unikalny identyfikator aukcji.
 * @returns {Promise<Object>} Obiekt zawierający dane aukcji w polu 'data'.
 * @throws {Error} Gdy aukcja nie zostanie znaleziona lub wystąpi błąd sieci.
 */
export const getAuction = async (id) => {
    const response = await fetch(`/api/bid/${id}`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Failed to fetch auction with id ${id}`);
    try {
        const data = await response.json();
        return { data };
    } catch {
        return { data: null };
    }
};

/**
 * @function placeBid
 * @async
 * @description Przesyła nową ofertę licytacji dla wybranej aukcji z rozbudowaną obsługą błędów serwera.
 * @param {number|string} id - ID aukcji, w której składana jest oferta.
 * @param {number} amount - Kwota nowej oferty (podbicie).
 * @returns {Promise<Object>} Wynik operacji zwrócony przez serwer.
 * @throws {Error} Gdy oferta jest zbyt niska, aukcja wygasła lub wystąpił błąd walidacji/bazy danych.
 */
export const placeBid = async (id, amount) => {
    const response = await fetch(`/api/bid/${id}/bid`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ amount })
    });

    if (!response.ok) {
        let errorMessage = `Failed to place bid on auction ${id}`;

        try {
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorData.title || errorMessage;
                console.error("Server error (JSON):", errorData);
            } else {
                const errorText = await response.text();
                console.error("Server error (Text):", errorText);

                // Mapowanie specyficznych wyjątków .NET na czytelne komunikaty
                if (errorText.includes("ArgumentNullException")) {
                    errorMessage = "Server error: Missing required data";
                } else if (errorText.includes("SqlException")) {
                    errorMessage = "Database error occurred";
                } else {
                    errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
                }
            }
        } catch (parseError) {
            console.error("Could not parse error response:", parseError);
        }

        throw new Error(errorMessage);
    }

    return response.json();
};

/**
 * @function createAuction
 * @async
 * @description Tworzy nową aukcję dla wskazanego produktu.
 * @param {Object} data - Obiekt z danymi aukcji.
 * @param {number} data.productId - ID produktu do wystawienia.
 * @param {number} data.startingPrice - Cena wywoławcza.
 * @param {number} [data.durationMinutes=10] - Czas trwania aukcji w minutach.
 * @returns {Promise<Object|null>} Dane utworzonej aukcji lub null w przypadku błędu parsowania.
 * @throws {Error} Gdy wystąpi błąd podczas tworzenia licytacji.
 */
export const createAuction = async (data) => {
    const response = await fetch("/api/bid/create", {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
            productId: data.productId,
            startingPrice: data.startingPrice,
            durationMinutes: data.durationMinutes || 10
        })
    });

    if (!response.ok) throw new Error("Failed to create auction");
    try {
        return await response.json();
    } catch {
        return null;
    }
};