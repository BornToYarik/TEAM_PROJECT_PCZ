import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * @file Registration.jsx
 * @brief Komponent strony rejestracji nowego uzytkownika.
 * @details Modul obsluguje formularz tworzenia konta, walidacje zgodnosci hasel 
 * oraz komunikacje z API uwierzytelniania w celu rejestracji uzytkownika.
 */

/**
 * @component Registration
 * @description Renderuje interfejs rejestracji. Zarzadza lokalnym stanem formularza, 
 * komunikatami o bledach/sukcesach oraz przekierowaniem po poprawnym utworzeniu konta.
 */
function Registration() {
    /** @brief Stan przechowujacy dane wejsciowe formularza (login, email, hasla). */
    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    /** @brief Tresc komunikatu o sukcesie operacji. */
    const [message, setMessage] = useState("");
    /** @brief Tresc komunikatu o bledzie (walidacja lub odpowiedz serwera). */
    const [error, setError] = useState("");

    const navigate = useNavigate();

    /**
     * @function handleChange
     * @description Handler aktualizujacy stan formularza na podstawie zmian w polach input.
     * @param {Event} e - Obiekt zdarzenia zmiany.
     */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * @function handleSubmit
     * @async
     * @description Obsluguje wysylanie danych rejestracyjnych do serwera.
     * @details Sprawdza zgodnosc hasel przed wysylka. Po pomyslnej rejestracji 
     * wyswietla komunikat i przekierowuje do strony logowania po 2 sekundach.
     * @param {Event} e - Obiekt zdarzenia submit.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // Walidacja zgodnosci hasel po stronie klienta
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch("/api/Auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: form.userName,
                    email: form.email,
                    password: form.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed");
            } else {
                setMessage(data.message || "Registration successful! Redirecting to login...");
                setForm({ userName: "", email: "", password: "", confirmPassword: "" });

                // Opoznione przekierowanie dla lepszego UX
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err) {
            setError("Network error: " + err.message);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center bg-light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <Card className="shadow-sm border-0 rounded-lg">
                            <Card.Body className="p-4">
                                <Card.Title as="h2" className="text-center mb-4 fw-bold">
                                    Registration
                                </Card.Title>

                                {message && <Alert variant="success" className="border-0 shadow-sm">{message}</Alert>}
                                {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formBasicName">
                                        <Form.Label className="fw-semibold">Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-lg shadow-none"
                                            placeholder="Enter your name"
                                            name="userName"
                                            value={form.userName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label className="fw-semibold">Email address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            className="form-control-lg shadow-none"
                                            placeholder="Enter email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label className="fw-semibold">Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            className="form-control-lg shadow-none"
                                            placeholder="Enter password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
                                        <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            className="form-control-lg shadow-none"
                                            placeholder="Confirm password"
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button variant="success" type="submit" size="lg" className="fw-bold shadow-sm">
                                            Register
                                        </Button>
                                    </div>
                                </Form>

                                <div className="text-center mt-4">
                                    <a href="/login" className="text-decoration-none text-muted">
                                        Already have an account? <span className="text-primary fw-bold">Log in</span>
                                    </a>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Registration;