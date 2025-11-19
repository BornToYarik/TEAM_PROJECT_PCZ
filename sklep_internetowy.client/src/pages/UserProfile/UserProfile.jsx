import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function UserProfile() {
    const [userData, setUserData] = useState({ userName: "", email: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/Account/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData({ userName: data.userName, email: data.email });
                } else {
                    setError("Could not load user data.");
                }
            } catch { 
                setError("Network error.");
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Session expired. Please log in again.");
            navigate("/login");
            return;
        }

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

                setError(data.message || "Update failed.");
            } else {
                
                setMessage(data.message || "Profile updated successfully!");
            }
        } catch { 
            setError("Network failed. Check server connection.");
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="shadow">
                            <Card.Header className="bg-primary text-white">
                                <h4 className="mb-0">My Profile</h4>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {message && <Alert variant="success">{message}</Alert>}
                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
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
                                        <Button variant="outline-secondary" onClick={() => navigate("/")}>
                                            Back to Home
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default UserProfile;