import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";

function LoginPage() {
    const [form, setForm] = useState({ userName: "", password: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch("https://localhost:53124/api/Auth/login", {
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
                setError(data.message || "Logowanie nie powiod³o siê");
            } else {
                setMessage("Zalogowano pomyœlnie!");
                if (data.token) {
                    // zapis tokena do localStorage
                    localStorage.setItem("token", data.token);
                }
                setForm({ userName: "", password: "" });
            }
        } catch (err) {
            setError("B³¹d sieci: " + err.message);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <Card className="shadow-sm">
                            <Card.Body className="p-4">
                                <Card.Title as="h2" className="text-center mb-4">Logowanie</Card.Title>

                                {message && <Alert variant="success">{message}</Alert>}
                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formBasicUserName">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Wpisz nazwê u¿ytkownika"
                                            name="userName"
                                            value={form.userName}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Has³o</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Wpisz has³o"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button variant="primary" type="submit" size="lg">
                                            Zaloguj
                                        </Button>
                                    </div>
                                </Form>

                                <div className="text-center mt-3">
                                    <a href="/registration" className="d-block mb-2">Rejestracja</a>
                                    <a href="/forgot-password">Zapomnia³eœ has³a?</a>
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
