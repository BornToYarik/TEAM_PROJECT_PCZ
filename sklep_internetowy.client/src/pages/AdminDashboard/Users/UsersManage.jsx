import React, { useEffect, useState } from "react";

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({ email: "", userName: "", password: "", roles: ["User"] });
    const [error, setError] = useState("");

    // Получение всех пользователей
    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Создание нового пользователя
    const handleCreate = async () => {
        try {
            const payload = {
                email: newUser.email,
                userName: newUser.email,
                password: newUser.password,
                roles: newUser.roles
            };
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData?.errors?.[0]?.description || "Failed to create user");
            }
            setNewUser({ email: "", userName: "", password: "", roles: ["User"] });
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // Обновление пользователя
    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            const payload = {
                email: editingUser.email,
                roles: editingUser.roles
            };
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData?.errors?.[0]?.description || "Failed to update user");
            }
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // Сброс пароля
    const handleResetPassword = async (id) => {
        try {
            const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to reset password");
            const data = await res.json();
            alert(`New password: ${data.newPassword}`);
        } catch (err) {
            setError(err.message);
        }
    };

    // Удаление пользователя
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete user");
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // Изменение роли в интерфейсе
    const handleChangeRole = (user, role) => {
        setEditingUser({ ...user, roles: [role] });
    };

    return (
        <div className="container py-4">
            <h1>Admin Panel — Users</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card p-3 mb-3">
                <h3>Create User</h3>
                <input className="form-control mb-2" placeholder="Email"
                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                <input className="form-control mb-2" placeholder="Password"
                    value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                <select className="form-select mb-2" value={newUser.roles[0]}
                    onChange={e => setNewUser({ ...newUser, roles: [e.target.value] })}>
                    <option>User</option>
                    <option>Admin</option>
                </select>
                <button className="btn btn-success" onClick={handleCreate}>Create</button>
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.email}</td>
                            <td>
                                <select value={u.roles[0]} onChange={e => handleChangeRole(u, e.target.value)}>
                                    <option>User</option>
                                    <option>Admin</option>
                                </select>
                            </td>
                            <td>
                                <button className="btn btn-primary btn-sm me-2" onClick={() => setEditingUser(u)}>Edit</button>
                                <button className="btn btn-warning btn-sm me-2" onClick={() => handleResetPassword(u.id)}>Reset</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingUser && (
                <div className="card p-3">
                    <h3>Edit User</h3>
                    <input className="form-control mb-2" value={editingUser.email}
                        onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                    <select className="form-select mb-2" value={editingUser.roles[0]}
                        onChange={e => setEditingUser({ ...editingUser, roles: [e.target.value] })}>
                        <option>User</option>
                        <option>Admin</option>
                    </select>
                    <button className="btn btn-success me-2" onClick={handleUpdate}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
}
