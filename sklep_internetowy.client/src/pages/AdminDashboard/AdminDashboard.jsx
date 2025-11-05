import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function AdminDashboard() {
    return (
        <div className="min-vh-100 d-flex align-items-center bg-light">
            <Container>
                <h2 className="text-center mb-5">Admin Dashboard</h2>

                <Row className="justify-content-center g-4">
                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0">
                            <Card.Body>
                                <i className="bi bi-bag-check-fill fs-1 text-primary mb-3"></i>
                                <Card.Title>Orders</Card.Title>
                                <Card.Text>Manage customer orders</Card.Text>
                                { /* tu zmieñcie œcie¿kê */}
                                <Link to="/admin/orders" className="btn btn-primary">
                                    Go to Orders
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0">
                            <Card.Body>
                                <i className="bi bi-people-fill fs-1 text-success mb-3"></i>
                                <Card.Title>Users</Card.Title>
                                <Card.Text>Manage registered users</Card.Text>
                                { /* tu zmieñcie œcie¿kê */}
                                <Link to="/admin/users" className="btn btn-success">
                                    Go to Users
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0">
                            <Card.Body>
                                <i className="bi bi-box-seam fs-1 text-warning mb-3"></i>
                                <Card.Title>Products</Card.Title>
                                <Card.Text>Manage store products</Card.Text>
                                { /* tu zmieñcie œcie¿kê */}
                                <Link to="/admin/products" className="btn btn-warning text-white">
                                    Go to Products
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="shadow-sm text-center border-0">
                            <Card.Body>
                                <i className="bi bi-envelope fs-1 text-warning mb-3"></i>
                                <Card.Title>Messages</Card.Title>
                                <Card.Text>Manage customer messages</Card.Text>
                                { /* tu zmieñcie œcie¿kê */}
                                <Link to="/admin/messages" className="btn btn-warning text-white">
                                    Go to Messages
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
