import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

function Registration() {
    return (
        <div className="min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <Card className="shadow-sm">
                            <Card.Body className="p-4">
                                <Card.Title as="h2" className="text-center mb-4">
                                    Registration
                                </Card.Title>

                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicName">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter your name" />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email" />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Enter password" />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control type="password" placeholder="Confirm password" />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button variant="success" type="submit" size="lg">
                                            Register
                                        </Button>
                                    </div>
                                </Form>

                                <div className="text-center mt-3">
                                    <a href="/login" className="d-block mb-2">
                                        Already have an account? Log in
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
