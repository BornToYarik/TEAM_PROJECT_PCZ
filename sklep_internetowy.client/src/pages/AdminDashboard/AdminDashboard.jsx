import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * @file AdminDashboard.jsx
 * @brief Glowny panel sterowania (Dashboard) administratora systemu TechStore.
 * @details Komponent sluzy jako centralny punkt nawigacyjny, agregujacy skroty do wszystkich 
 * kluczowych modulow administracyjnych: zamowien, uzytkownikow, produktow, wiadomosci oraz promocji.
 */

/**
 * @component AdminDashboard
 * @description Renderuje responsywny interfejs kafelkowy (grid kart), gdzie kazda karta 
 * reprezentuje osobny obszar zarzadzania systemem e-commerce.
 */
function AdminDashboard() {
    return (
        <div className="min-vh-100 d-flex align-items-center bg-light">
            <Container>
                <h2 className="text-center mb-5">Admin Dashboard</h2>

                <Row className="justify-content-center g-4">
                    {/* MODUL: ZAMOWIENIA */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-bag-check-fill fs-1 text-primary mb-3"></i>
                                <Card.Title>Orders</Card.Title>
                                <Card.Text className="flex-grow-1">Manage customer orders</Card.Text>
                                {/* Sciezka do zarzadzania zamowieniami */}
                                <Link to="/admin/orders" className="btn btn-primary">
                                    Go to Orders
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUL: UZYTKOWNICY */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-people-fill fs-1 text-success mb-3"></i>
                                <Card.Title>Users</Card.Title>
                                <Card.Text className="flex-grow-1">Manage registered users</Card.Text>
                                {/* Sciezka do zarzadzania uzytkownikami */}
                                <Link to="/admin/users" className="btn btn-success">
                                    Go to Users
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUL: PRODUKTY */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-box-seam fs-1 text-warning mb-3"></i>
                                <Card.Title>Products</Card.Title>
                                <Card.Text className="flex-grow-1">Manage store products</Card.Text>
                                {/* Sciezka do katalogu produktow */}
                                <Link to="/admin/products" className="btn btn-warning text-white">
                                    Go to Products
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUL: WIADOMOSCI */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-envelope fs-1 text-warning mb-3"></i>
                                <Card.Title>Messages</Card.Title>
                                <Card.Text className="flex-grow-1">Manage customer messages</Card.Text>
                                {/* Sciezka do skrzynki odbiorczej */}
                                <Link to="/admin/messages" className="btn btn-warning text-white">
                                    Go to Messages
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUL: PROMOCJE I WYPRZEDAZE */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-tags fs-1 text-warning mb-3"></i>
                                <Card.Title>Promotions Management</Card.Title>
                                <Card.Text className="flex-grow-1">Manage promotions</Card.Text>
                                {/* Sciezka do panelu automatyzacji promocji */}
                                <Link to="/admin/promotions" className="btn btn-warning text-white">
                                    Manage
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default AdminDashboard;