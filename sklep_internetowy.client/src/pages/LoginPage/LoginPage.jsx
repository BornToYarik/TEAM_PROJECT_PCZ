import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";

import { useNavigate } from "react-router-dom";

/**
 * @file LoginPage.jsx
 * @brief Komponent strony logowania uzytkownika.
 * @details Modul obsluguje interfejs logowania, walidacje po stronie klienta oraz komunikacje 
 * z serwerem w celu uzyskania tokenu autoryzacyjnego JWT.
 */

/**
 * @component LoginPage
 * @description Renderuje formularz logowania i zarzadza stanem uwierzytelniania.
 * Po pomyslnym logowaniu zapisuje dane sesji w localStorage i przekierowuje uzytkownika.
 */
function LoginPage() {
    /** @brief Stan przechowujacy dane logowania (login i haslo). */
    const [form, setForm] = useState({ userName: "", password: "" });
    /** @brief Komunikat o sukcesie operacji. */
    const [message, setMessage] = useState("");
    /** @brief Przechowuje komunikaty o bledach autoryzacji lub sieci. */
    const [error, setError] = useState("");


    const navigate = useNavigate();

    /**
     * @function handleChange
     * @description Aktualizuje lokalny stan formularza przy kazdej zmianie w polach tekstowych.
     * @param {Event} e - Obiekt zdarzenia zmiany pola wejsciowego.
     */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * @function handleSubmit
     * @async
     * @description Obsluguje proces wysylania danych logowania do API.
     * @details Wykonuje zadanie POST do /api/Auth/login. W przypadku sukcesu ustawia 
     * token i dane uzytkownika w pamieci przegladarki.
     * @param {Event} e - Obiekt zdarzenia wyslania formularza.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch("/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: form.userName,
                    password: form.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
            } else {

                setMessage(data.message || "Login successful!");

                if (data.token) {
                    localStorage.setItem("token", data.token);
                    const userData = {
                        id: data.userId,
                        email: data.email,
                        userName: form.userName
                    };
                    localStorage.setItem("user", JSON.stringify(userData));

                    setTimeout(() => {

                        navigate("/");
                    }, 1500);
                }
                setForm({ userName: "", password: "" });
            }
        } catch (err) {
            setError("Network failed: " + err.message);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <Card className="shadow-sm">
                            <Card.Body className="p-4">
                                <Card.Title as="h2" className="text-center mb-4">Login</Card.Title>

                                {message && <Alert variant="success">{message}</Alert>}
                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formBasicUserName">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter username"
                                            name="userName"
                                            value={form.userName}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button variant="primary" type="submit" size="lg">
                                            Login
                                        </Button>
                                    </div>
                                </Form>

                                <div className="text-center mt-3">
                                    <a href="/registration" className="d-block mb-2">Registration</a>
                                    <a href="/forgot-password">Forgot password?</a>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default LoginPage;