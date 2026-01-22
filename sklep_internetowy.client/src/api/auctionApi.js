/**
 * @file auctionApi.js
 * @brief Serwis kliencki do obslugi zapytan API zwiazanych z systemem aukcyjnym.
 * @details Zawiera zestaw funkcji asynchronicznych do komunikacji z kontrolerem BidController,
 * obslugujac pobieranie danych aukcji, licytowanie oraz tworzenie nowych licytacji.
 */

/**
 * @function getHeaders
 * @description Funkcja pomocnicza generujaca naglowki zapytan HTTP, w tym token autoryzacyjny Bearer.
 * @param {Object} customHeaders - Dodatkowe specyficzne naglowki (np. Content-Type).
 * @returns {Object} Zestaw naglowkow z dolaczonym tokenem JWT z localStorage.
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
 * @description Pobiera liste wszystkich obecnie aktywnych (trwajacych) aukcji.
 * @returns {Promise<Array>} Obietnica zwracajaca tablice obiektow AuctionDto.
 * @throws {Error} Gdy serwer zwroci blad podczas pobierania.
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
 * @description Pobiera szczegolowe dane konkretnej aukcji na podstawie jej identyfikatora.
 * @param {number|string} id - Unikalny identyfikator aukcji.
 * @returns {Promise<Object>} Obiekt zawierajacy dane aukcji w polu 'data'.
 * @throws {Error} Gdy aukcja nie zostanie znaleziona lub wystapi blad sieci.
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
 * @description Przesyla nowa oferte licytacji dla wybranej aukcji.
 * @param {number|string} id - ID aukcji, w ktorej skladana jest oferta.
 * @param {number} amount - Kwota nowej oferty (podbicie).
 * @returns {Promise<Object>} Wynik operacji zwrocony przez serwer.
 * @throws {Error} Gdy oferta jest zbyt niska, aukcja wygasla lub wystapil blad autoryzacji.
 */
export const placeBid = async (id, amount) => {
    const response = await fetch(`/api/bid/${id}/bid`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ amount })
    });
    if (!response.ok) throw new Error(`Failed to place bid on auction ${id}`);
    return response.json();
};

/**
 * @function createAuction
 * @async
 * @description Tworzy nowa aukcje dla wskazanego produktu.
 * @param {Object} data - Obiekt z danymi aukcji.
 * @param {number} data.productId - ID produktu do wystawienia.
 * @param {number} data.startingPrice - Cena wywolawcza.
 * @returns {Promise<Object|null>} Dane utworzonej aukcji lub null w przypadku bledu parsowania.
 * @throws {Error} Gdy wystapi blad podczas tworzenia licytacji.
 */
export const createAuction = async (data) => {
    const response = await fetch("/api/bid/create", {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
            productId: data.productId,
            startingPrice: data.startingPrice
        })
    });
    if (!response.ok) throw new Error("Failed to create auction");
    try {
        return await response.json();
    } catch {
        return null;
    }
};