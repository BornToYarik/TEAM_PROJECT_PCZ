import React, { useEffect, useState } from "react";

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetch("https://localhost:7283/api/users/adminGet")
            .then((res) => res.json())
            .then(setUsers)
            .catch(console.error);
    }, []);


    const handleUpdate = async () => {
        if (!editingUser) return;

        await fetch(`https://localhost:7283/api/users/adminPut${editingUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingUser),
        });


        setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? editingUser : u))
        );
        setEditingUser(null);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin Panel (Users)</h1>

            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td className="border p-2">{u.id}</td>
                            <td className="border p-2">{u.email}</td>
                            <td className="border p-2">{u.role}</td>
                            <td className="border p-2">
                                <button
                                    className="px-3 py-1 bg-blue-500 text-white rounded"
                                    onClick={() => setEditingUser(u)}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingUser && (
                <div className="mt-4 border p-4 bg-gray-50 rounded">
                    <h2 className="text-lg font-semibold mb-2">Edit User</h2>
                    <label className="block mb-2">
                        Email:
                        <input
                            type="text"
                            className="border ml-2 p-1"
                            value={editingUser.email}
                            onChange={(e) =>
                                setEditingUser({ ...editingUser, email: e.target.value })
                            }
                        />
                    </label>
                    <label className="block mb-2">
                        Role:
                        <input
                            type="text"
                            className="border ml-2 p-1"
                            value={editingUser.role}
                            onChange={(e) =>
                                setEditingUser({ ...editingUser, role: e.target.value })
                            }
                        />
                    </label>
                    <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
