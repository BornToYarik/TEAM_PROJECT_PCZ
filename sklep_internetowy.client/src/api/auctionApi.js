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
    if (!response.ok) throw new Error(`Failed to place bid on auction ${id}`);
    return response.json();
};


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