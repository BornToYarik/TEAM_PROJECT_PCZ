import React, { useEffect, useState } from "react";

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        email: "",
        password: "",
        roles: ["User"]
    });
    const [error, setError] = useState("");

 
    const handleError = async (res, defaultMsg) => {
        const errData = await res.json().catch(() => null);
        const msg = errData?.errors?.[0]?.description || defaultMsg;
        throw new Error(msg);
    };

    const fetchJSON = async (url, options = {}) => {
        const res = await fetch(url, options);
        if (!res.ok) await handleError(res, "Request failed");
        return res.json();
    };

    const fetchUsers = async () => {
        try {
            const data = await fetchJSON("/api/admin/users");
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

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
