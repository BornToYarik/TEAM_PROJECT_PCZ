import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";

/**
 * @file UserMessageManagement.jsx
 * @brief Komponent panelu administracyjnego do zarzadzania wiadomosciami kontaktowymi.
 * @details Umozliwia przegladanie, tworzenie, edycje oraz usuwanie zgloszen przeslanych przez uzytkownikow.
 */

/**
 * @component UserMessageManagement
 * @description Renderuje interfejs administratora do obslugi wiadomosci. 
 * Zawiera logike pobierania danych z API oraz zarzadzania oknami modalnymi dla operacji CRUD.
 */
function UserMessageManagement() {
    /** @brief Stan przechowujacy liste wiadomosci pobranych z bazy danych. */
    const [messages, setMessages] = useState([]);
    /** @brief Flaga okreslajaca stan ladowania danych. */
    const [loading, setLoading] = useState(true);
    /** @brief Przechowuje komunikaty o bledach operacji asynchronicznych. */
    const [error, setError] = useState(null);

    /** @brief Status widocznosci modala edycji. */
    const [showEditModal, setShowEditModal] = useState(false);
    /** @brief Status widocznosci modala usuwania. */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    /** @brief Status widocznosci modala tworzenia nowej wiadomosci. */
    const [showCreateModal, setShowCreateModal] = useState(false);

    /** @brief Obiekt aktualnie edytowanej lub usuwanej wiadomosci. */
    const [editingMessage, setEditingMessage] = useState(null);
    /** @brief Dane poczatkowe dla formularza nowej wiadomosci. */
    const [newMessage, setNewMessage] = useState({
        email: "",
        name: "",
        phone: "",
        content: ""
    });

    /**
     * @function fetchMessages
     * @async
     * @description Pobiera wszystkie wiadomosci z punktu koncowego API.
     */
    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/panel/UserMessage");
            if (!res.ok) throw new Error("Failed to load messages");
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /** @effect Inicjalizacja komponentu poprzez pobranie danych z serwera. */
    useEffect(() => { fetchMessages(); }, []);

    /**
     * @function handleCloseModal
     * @description Zamyka wszystkie otwarte okna modalne i resetuje stany formularzy oraz bledow.
     */
    const handleCloseModal = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowCreateModal(false);
        setEditingMessage(null);
        setNewMessage({ email: "", name: "", phone: "", content: "" });
        setError(null);
    };

    /**
     * @function handleCreate
     * @async
     * @description Przesyla nowa wiadomosc do serwera metoda POST.
     */
    const handleCreate = async () => {
        try {
            const res = await fetch("/api/panel/UserMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMessage)
            });
            if (!res.ok) throw new Error("Failed to create message");
            await fetchMessages();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function handleSave
     * @async
     * @description Aktualizuje istniejaca wiadomosc metoda PUT.
     */
    const handleSave = async () => {
        try {
            const res = await fetch(`/api/panel/UserMessage/${editingMessage.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingMessage)
            });
            if (!res.ok) throw new Error("Failed to update message");
            await fetchMessages();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function confirmDelete
     * @async
     * @description Trwale usuwa wiadomosc z bazy danych metoda DELETE.
     */
    const confirmDelete = async () => {
        try {
            const res = await fetch(`/api/panel/UserMessage/${editingMessage.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setMessages(current => current.filter(m => m.id !== editingMessage.id));
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Container className="p-4"><Spinner animation="border" /></Container>;

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">User Messages</h2>
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            <Button variant="success" className="mb-3" onClick={() => setShowCreateModal(true)}>
                <i className="bi bi-plus-circle-fill"></i> New Message
            </Button>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Content</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map(m => (
                        <tr key={m.id}>
                            <td>{m.id}</td>
                            <td>{m.email}</td>
                            <td>{m.name}</td>
                            <td>{m.phone || "-"}</td>
                            <td style={{ maxWidth: "250px" }}>{m.content}</td>
                            <td>{new Date(m.createdAt).toLocaleString()}</td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => { setEditingMessage(m); setShowEditModal(true); }}>
                                    <i className="bi bi-pencil-fill"></i>
                                </Button>{" "}
                                <Button variant="danger" size="sm" onClick={() => { setEditingMessage(m); setShowDeleteModal(true); }}>
                                    <i className="bi bi-trash-fill"></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* --- CREATE MODAL --- */}
            <Modal show={showCreateModal} onHide={handleCloseModal}>
                <Modal.Header closeButton><Modal.Title>Create Message</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control value={newMessage.email} onChange={(e) => setNewMessage(m => ({ ...m, email: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control value={newMessage.name} onChange={(e) => setNewMessage(m => ({ ...m, name: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control value={newMessage.phone} onChange={(e) => setNewMessage(m => ({ ...m, phone: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Content</Form.Label>
                            <Form.Control as="textarea" rows={4} value={newMessage.content} onChange={(e) => setNewMessage(m => ({ ...m, content: e.target.value }))} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="success" onClick={handleCreate}>Create</Button>
                </Modal.Footer>
            </Modal>

            {/* --- EDIT MODAL --- */}
            {editingMessage && (
                <Modal show={showEditModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton><Modal.Title>Edit Message #{editingMessage.id}</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control value={editingMessage.email} onChange={(e) => setEditingMessage(m => ({ ...m, email: e.target.value }))} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control value={editingMessage.name} onChange={(e) => setEditingMessage(m => ({ ...m, name: e.target.value }))} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control value={editingMessage.phone || ""} onChange={(e) => setEditingMessage(m => ({ ...m, phone: e.target.value }))} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Content</Form.Label>
                                <Form.Control as="textarea" rows={4} value={editingMessage.content} onChange={(e) => setEditingMessage(m => ({ ...m, content: e.target.value }))} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* --- DELETE MODAL --- */}
            <Modal show={showDeleteModal} onHide={handleCloseModal}>
                <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
                <Modal.Body>Delete message from <strong>{editingMessage?.email}</strong>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default UserMessageManagement;