import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

function LoginPage() {
  return (
      <div className="min-vh-100 d-flex align-items-center">

          <Container>
              <Row className="justify-content-center">

                  <Col md={8} lg={6} xl={5}>
                      <Card className="shadow-sm">
                          <Card.Body className="p-4">
                              <Card.Title as="h2" className="text-center mb-4">Log In</Card.Title>

                              <Form>
                                  <Form.Group className="mb-3" controlId="formBasicEmail">
                                      <Form.Label>Email</Form.Label>
                                      <Form.Control type="email" placeholder="Enter email" />
                                  </Form.Group>

                                  <Form.Group className="mb-3" controlId="formBasicPassword">
                                      <Form.Label>Password</Form.Label>
                                      <Form.Control type="password" placeholder="Password" />
                                  </Form.Group>

                                  <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                      <Form.Check type="checkbox" label="Check me out" />
                                  </Form.Group>

                                  <div className="d-grid">
                                      <Button variant="primary" type="submit" size="lg">
                                          Submit
                                      </Button>
                                  </div>
                              </Form>
                              <div className="text-center mt-3">
                                  <a href="/registration" className="d-block mb-2">Registration</a>
                                  <a href="/forgot-password">Forgot your password?</a>
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