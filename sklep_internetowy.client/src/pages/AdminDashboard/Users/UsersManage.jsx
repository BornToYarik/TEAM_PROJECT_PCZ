import React, { useEffect, useState } from "react";

/**
 * @file AdminPanel.jsx
 * @brief Komponent panelu administracyjnego do zarzadzania uzytkownikami.
 * @details Modul umozliwia pelna kontrole nad kontami uzytkownikow, w tym tworzenie nowych kont,
 * edycje ról, usuwanie uzytkownikow oraz systemowe resetowanie zapomnianych hasel.
 */

/**
 * @component AdminPanel
 * @description Glowny komponent widoku administracyjnego. Zarzadza stanem listy uzytkownikow
 * oraz koordynuje operacje CRUD wykonywane na bazie danych uzytkownikow systemu TechStore.
 */
export default function AdminPanel() {
    /** @brief Stan przechowujacy tablice uzytkownikow pobrana z API. */
    const [users, setUsers] = useState([]);
    /** @brief Obiekt uzytkownika wybranego do edycji (null, jesli nie trwa edycja). */
    const [editingUser, setEditingUser] = useState(null);
    /** @brief Stan formularza dla nowego uzytkownika (email, haslo, rola). */
    const [newUser, setNewUser] = useState({
        email: "",
        password: "",
        roles: ["User"]
    });
    /** @brief Przechowuje komunikaty o bledach wystepujacych podczas komunikacji z serwerem. */
    const [error, setError] = useState("");

    /**
     * @function handleError
     * @async
     * @description Przetwarza bledna odpowiedz serwera i wyodrebnia komunikat bledu z formatu JSON.
     * @param {Response} res - Obiekt odpowiedzi z funkcji fetch.
     * @param {string} defaultMsg - Komunikat domyslny uzywany w przypadku braku opisu bledu z API.
     * @throws {Error} Rzuca blad z wyodrebnionym opisem.
     */
    const handleError = async (res, defaultMsg) => {
        const errData = await res.json().catch(() => null);
        const msg = errData?.errors?.[0]?.description || defaultMsg;
        throw new Error(msg);
    };

    /**
     * @function fetchJSON
     * @async
     * @description Pomocnicza metoda do wykonywania zapytan sieciowych zwracajacych dane w formacie JSON.
     * @param {string} url - Adres docelowy endpointu API.
     * @param {Object} options - Dodatkowe opcje zapytania (metoda, naglowki, body).
     * @returns {Promise<Object>} Zdekodowany obiekt JSON z odpowiedzi serwera.
     */
    const fetchJSON = async (url, options = {}) => {
        const res = await fetch(url, options);
        if (!res.ok) await handleError(res, "Request failed");
        return res.json();
    };

    /**
     * @function fetchUsers
     * @async
     * @description Pobiera aktualna liste wszystkich uzytkownikow zarejestrowanych w systemie.
     */
    const fetchUsers = async () => {
        try {
            const data = await fetchJSON("/api/admin/users");
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function createUser
     * @async
     * @description Tworzy nowe konto uzytkownika na podstawie danych wprowadzonych do formularza "Create User".
     */
    const createUser = async () => {
        try {
            const payload = {
                email: newUser.email,
                userName: newUser.email,
                password: newUser.password,
                roles: newUser.roles
            };

            await fetchJSON("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            setNewUser({ email: "", password: "", roles: ["User"] });
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function updateUser
     * @async
     * @description Przesyla zaktualizowane dane edytowanego uzytkownika (email i role) do serwera.
     */
    const updateUser = async () => {
        if (!editingUser) return;

        try {
            await fetchJSON(`/api/admin/users/${editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: editingUser.email,
                    roles: editingUser.roles
                })
            });

            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function resetPassword
     * @async
     * @description Inicjuje proces resetowania hasla dla wybranego uzytkownika i wyswietla nowe haslo tymczasowe.
     * @param {number|string} id - Identyfikator uzytkownika.
     */
    const resetPassword = async (id) => {
        if (!confirm("Reset this user's password?")) return;

        try {
            const data = await fetchJSON(`/api/admin/users/${id}/reset-password`, {
                method: "POST"
            });

            alert(`New password: ${data.newPassword}`);
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function deleteUser
     * @async
     * @description Trwale usuwa konto uzytkownika z systemu po potwierdzeniu operacji przez administratora.
     * @param {number|string} id - Identyfikator uzytkownika.
     */
    const deleteUser = async (id) => {
        if (!confirm("Delete this user?")) return;

        try {
            await fetchJSON(`/api/admin/users/${id}`, {
                method: "DELETE"
            });
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @effect Inicjalizacja danych.
     * @description Wywoluje pobranie listy uzytkownikow przy pierwszym wyrenderowaniu komponentu.
     */
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="container py-4">
            <h1>Admin Panel — Users</h1>

            {error && <div className="alert alert-danger">{error}</div>}


            <div className="card p-3 mb-4">
                <h3>Create User</h3>

                <input
                    className="form-control mb-2"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />

                <input
                    className="form-control mb-2"
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />

                <button className="btn btn-success" onClick={createUser}>
                    Create
                </button>
            </div>


            <table className="table table-bordered align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th width="270px">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.email}</td>
                            <td>{u.roles[0]}</td>

                            <td>
                                <button
                                    className="btn btn-primary btn-sm me-2"
                                    onClick={() => setEditingUser(u)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => resetPassword(u.id)}
                                >
                                    Reset Password
                                </button>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteUser(u.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {editingUser && (
                <div className="card p-3 mt-3">
                    <h3>Edit User</h3>

                    <input
                        className="form-control mb-2"
                        value={editingUser.email}
                        onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    />

                    <select
                        className="form-select mb-2"
                        value={editingUser.roles[0]}
                        onChange={e =>
                            setEditingUser({ ...editingUser, roles: [e.target.value] })
                        }
                    >
                        <option>User</option>
                        <option>Admin</option>
                    </select>

                    <button className="btn btn-success me-2" onClick={updateUser}>
                        Save
                    </button>

                    <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}