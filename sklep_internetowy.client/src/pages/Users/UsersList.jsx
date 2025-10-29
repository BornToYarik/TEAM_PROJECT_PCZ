import React, { useState, useMemo } from "react";

export default function UsersList({ users = [] }) {
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState("asc");

    const filteredUsers = useMemo(() => {
        const q = query.toLowerCase().trim();

        let list = users.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.role && u.role.toLowerCase().includes(q))
        );

        list.sort((a, b) => {
            const av = a[sortBy]?.toLowerCase?.() ?? "";
            const bv = b[sortBy]?.toLowerCase?.() ?? "";
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [users, query, sortBy, sortDir]);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Lista użytkowników</h1>

            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Szukaj po imieniu, emailu lub roli..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border px-3 py-2 rounded-md flex-1"
                />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="name">Imię</option>
                    <option value="email">Email</option>
                    <option value="role">Rola</option>
                </select>
                <button
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                    className="border px-3 py-2 rounded-md"
                >
                    {sortDir === "asc" ? "↑" : "↓"}
                </button>
            </div>

            
            <div className="hidden md:block border rounded-md overflow-hidden">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-4 py-2">Imię</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Rola</th>
                            <th className="px-4 py-2">Data utworzenia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{u.name}</td>
                                <td className="px-4 py-2">{u.email}</td>
                                <td className="px-4 py-2">{u.role || "—"}</td>
                                <td className="px-4 py-2">
                                    {u.createdAt
                                        ? new Date(u.createdAt).toLocaleDateString()
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                    Brak użytkowników do wyświetlenia
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

           
            <div className="md:hidden space-y-3">
                {filteredUsers.map((u) => (
                    <div
                        key={u.id}
                        className="border rounded-md p-3 flex items-start gap-3"
                    >
                        <div className="flex-1">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-sm text-gray-600">{u.email}</div>
                            <div className="text-sm text-gray-500">
                                Rola: {u.role || "—"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
