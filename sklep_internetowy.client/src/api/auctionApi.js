const getHeaders = (customHeaders = {}) => {
    const token = localStorage.getItem("token");
    const headers = { ...customHeaders };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

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

export const placeBid = async (id, amount) => {
    const response = await fetch(`/api/bid/${id}/bid`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ amount })
    });

    if (!response.ok) {
        let errorMessage = `Failed to place bid on auction ${id}`;

        // Попытка получить текст ошибки
        try {
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorData.title || errorMessage;
                console.error("Server error (JSON):", errorData);
            } else {
                // Если это не JSON, читаем как текст
                const errorText = await response.text();
                console.error("Server error (Text):", errorText);

                // Попытка извлечь полезную информацию из HTML/текста ошибки
                if (errorText.includes("ArgumentNullException")) {
                    errorMessage = "Server error: Missing required data (ArgumentNullException)";
                } else if (errorText.includes("NullReferenceException")) {
                    errorMessage = "Server error: Null reference exception";
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

export const createAuction = async (data) => {
    const response = await fetch("/api/bid/create", {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
            productId: data.productId,
            startingPrice: data.startingPrice,
            durationMinutes: data.durationMinutes 
        })
    });
    if (!response.ok) throw new Error("Failed to create auction");
    try {
        return await response.json();
    } catch {
        return null;
    }
};