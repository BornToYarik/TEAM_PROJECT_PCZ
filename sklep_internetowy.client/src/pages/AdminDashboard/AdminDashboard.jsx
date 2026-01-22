import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * @file AdminDashboard.jsx
 * @brief Główny panel sterowania (Dashboard) administratora systemu TechStore.
 * @details Komponent służy jako centralny punkt nawigacyjny, agregujący skróty do wszystkich 
 * kluczowych modułów administracyjnych: zamówień, użytkowników, produktów, wiadomości oraz promocji.
 */

/**
 * @component AdminDashboard
 * @description Renderuje responsywny interfejs kafelkowy (grid kart), gdzie każda karta 
 * reprezentuje osobny obszar zarządzania systemem e-commerce.
 */
function AdminDashboard() {
    return (
        <div className="min-vh-100 d-flex align-items-center bg-light">
            <Container>
                <h2 className="text-center mb-5">Admin Dashboard</h2>

                <Row className="justify-content-center g-4">
                    {/* MODUŁ: ZAMÓWIENIA */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-bag-check-fill fs-1 text-primary mb-3"></i>
                                <Card.Title>Orders</Card.Title>
                                <Card.Text className="flex-grow-1">Manage customer orders</Card.Text>
                                {/* Ścieżka do zarządzania zamówieniami */}
                                <Link to="/admin/orders" className="btn btn-primary">
                                    Go to Orders
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUŁ: UŻYTKOWNICY */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-people-fill fs-1 text-success mb-3"></i>
                                <Card.Title>Users</Card.Title>
                                <Card.Text className="flex-grow-1">Manage registered users</Card.Text>
                                {/* Ścieżka do zarządzania użytkownikami */}
                                <Link to="/admin/users" className="btn btn-success">
                                    Go to Users
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUŁ: PRODUKTY */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-box-seam fs-1 text-warning mb-3"></i>
                                <Card.Title>Products</Card.Title>
                                <Card.Text className="flex-grow-1">Manage store products</Card.Text>
                                {/* Ścieżka do katalogu produktów */}
                                <Link to="/admin/products" className="btn btn-warning text-white">
                                    Go to Products
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUŁ: WIADOMOŚCI */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-envelope fs-1 text-warning mb-3"></i>
                                <Card.Title>Messages</Card.Title>
                                <Card.Text className="flex-grow-1">Manage customer messages</Card.Text>
                                {/* Ścieżka do skrzynki odbiorczej */}
                                <Link to="/admin/messages" className="btn btn-warning text-white">
                                    Go to Messages
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUŁ: AUKCJE */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-gem fs-1 text-danger mb-3"></i>
                                <Card.Title>Create Auction</Card.Title>
                                <Card.Text className="flex-grow-1">Create new auctions for products</Card.Text>
                                {/* Ścieżka do tworzenia nowych aukcji */}
                                <Link to="/admin/create-auction" className="btn btn-danger text-white">
                                    Go to Create Auction
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MODUŁ: PROMOCJE I WYPRZEDAŻE */}
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <i className="bi bi-tags fs-1 text-warning mb-3"></i>
                                <Card.Title>Promotions Management</Card.Title>
                                <Card.Text className="flex-grow-1">Manage store-wide promotions</Card.Text>
                                {/* Ścieżka do panelu automatyzacji promocji */}
                                <Link to="/admin/promotions" className="btn btn-warning text-white">
                                    Manage Promotions
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