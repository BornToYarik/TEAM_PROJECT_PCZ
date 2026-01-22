import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Alert, Table, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { pdf } from '@react-pdf/renderer';
import InvoiceDocument from '../../components/admin/InvoiceGenerator/InvoiceDocument';

/**
 * @file UserProfile.jsx
 * @brief Komponent widoku profilu uzytkownika wraz z historia zamowien.
 * @details Modul umozliwia zalogowanemu uzytkownikowi edycje danych profilowych (nazwa, email) 
 * oraz przegladanie zestawienia archiwalnych zamowien z mozliwoscia pobrania faktur PDF.
 */

/**
 * @component UserProfile
 * @description Glowny komponent zarzadzajacy danymi zalogowanego uzytkownika. 
 * Obsluguje pobieranie profilu, aktualizacje danych oraz ladowanie historii zakupow z API.
 */
function UserProfile() {
    /** @brief Stan przechowujacy podstawowe dane profilowe uzytkownika. */
    const [userData, setUserData] = useState({ userName: "", email: "" });
    /** @brief Obiekt stanu do obslugi komunikatow o statusie aktualizacji profilu. */
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    /** @brief Lista zamowien przypisanych do zalogowanego uzytkownika. */
    const [orders, setOrders] = useState([]);
    /** @brief Flaga kontrolujaca wyswietlanie spinnera ladowania dla sekcji zamowien. */
    const [loadingOrders, setLoadingOrders] = useState(true);

    const navigate = useNavigate();

    /**
     * @effect Inicjalizacja danych profilu i zamowien.
     * @description Sprawdza obecnosc tokenu JWT. Jesli uzytkownik jest zalogowany, 
     * pobiera dane profilu z /api/Account/me oraz historie zamowien.
     */
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login");
            return;
        }

        const userObj = JSON.parse(storedUser);

        /** @function fetchProfile
         * @async
         * @description Pobiera aktualne dane uzytkownika z API Account.
         */
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/Account/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserData({ userName: data.userName, email: data.email });
                }
            } catch (err) {
                console.error("Profile load error", err);
            }
        };

        /** @function fetchOrders
         * @async
         * @description Pobiera historie zamowien uzytkownika na podstawie identyfikatora.
         */
        const fetchOrders = async () => {
            try {
                const response = await fetch(`/api/Orders/user/${userObj.id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error("Orders load error", err);
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchProfile();
        fetchOrders();
    }, [navigate]);

    /**
     * @function handleChange
     * @description Handler aktualizujacy lokalny stan formularza edycji profilu.
     * @param {Event} e - Zdarzenie zmiany pola input.
     */
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    /**
     * @function handleUpdateProfile
     * @async
     * @description Wysyla zadanie aktualizacji danych uzytkownika do serwera.
     * @param {Event} e - Zdarzenie submit formularza.
     */
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg({ type: '', text: '' });
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("/api/Account/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (!response.ok) {
                setProfileMsg({ type: 'danger', text: data.message || "Update failed." });
            } else {
                setProfileMsg({ type: 'success', text: "Profile updated successfully!" });
            }
        } catch {
            setProfileMsg({ type: 'danger', text: "Network error." });
        }
    };

    /**
     * @function downloadInvoice
     * @async
     * @description Generuje i inicjuje pobieranie faktury PDF dla wskazanego zamowienia.
     * @param {Object} order - Obiekt danych zamowienia.
     */
    const downloadInvoice = async (order) => {
        try {
            const blob = await pdf(<InvoiceDocument order={order} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `faktura_${order.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("PDF Error", error);
        }
    };

    /**
     * @function calculateTotal
     * @description Oblicza calkowita wartosc zamowienia na podstawie listy produktow.
     * @param {Object[]} products - Tablica produktow w zamowieniu.
     * @returns {string} Sformatowana suma zamowienia.
     */
    const calculateTotal = (products) => {
        return products.reduce((sum, p) => sum + (p.price * p.quantityInOrder), 0).toFixed(2);
    };

    /**
     * @function getStatusBadge
     * @description Zwraca odpowiedni kolor t?a dla badge'a statusu zamowienia.
     * @param {string} status - Nazwa statusu.
     * @returns {string} Nazwa wariantu stylu Bootstrap.
     */
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Completed': return 'success';
            case 'Cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4">My Account</h2>

            <Row>
                {/* KOLUMNA LEWA: Ustawienia profilu */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0"><i className="bi bi-person-gear me-2"></i>Profile Settings</h5>
                        </Card.Header>
                        <Card.Body>
                            {profileMsg.text && <Alert variant={profileMsg.type}>{profileMsg.text}</Alert>}

                            <Form onSubmit={handleUpdateProfile}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="userName"
                                        value={userData.userName}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* KOLUMNA PRAWA: Historia zamowien */}
                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Order History</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loadingOrders ? (
                                <div className="text-center p-5"><Spinner animation="border" /></div>
                            ) : orders.length === 0 ? (
                                <div className="text-center p-5 text-muted">
                                    <p>No orders found.</p>
                                    <Button variant="outline-primary" size="sm" onClick={() => navigate("/")}>Go Shopping</Button>
                                </div>
                            ) : (
                                <Table striped hover responsive className="mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td className="fw-bold">#{order.id}</td>
                                                <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
                                                <td>{calculateTotal(order.products)} zl</td>
                                                <td><Badge bg={getStatusBadge(order.status)}>{order.status}</Badge></td>
                                                <td>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => downloadInvoice(order)}
                                                        title="Download Invoice"
                                                    >
                                                        <i className="bi bi-file-earmark-pdf"></i> Invoice
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default UserProfile;