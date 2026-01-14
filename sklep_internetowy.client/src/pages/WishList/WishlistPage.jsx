import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

function WishlistPage() {
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (wishlist.length === 0) {
        return (
            <Container className="text-center py-5">
                <div className="mb-4">
                    <i className="bi bi-heart text-muted display-1"></i>
                </div>
                <h2>Your Wishlist is empty</h2>
                <p className="text-muted">Save items you want to see later.</p>
                <Link to="/" className="btn btn-primary">Go Shopping</Link>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">My Wishlist ({wishlist.length})</h2>
            <Row>
                {wishlist.map(product => (
                    <Col key={product.id} md={3} sm={6} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            {/*  */}
                            <div className="position-relative">
                                <Card.Img
                                    variant="top"
                                    src={product.imageUrl || "https://placehold.co/300x300"}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                {/*  */}
                                <button
                                    className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                                    onClick={() => toggleWishlist(product)}
                                    title="Remove"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="fs-6 text-truncate">{product.name}</Card.Title>
                                <Card.Text className="fw-bold text-primary mb-3">{product.price} zl</Card.Text>

                                <Button
                                    variant="outline-dark"
                                    className="mt-auto w-100"
                                    onClick={() => addToCart(product)}
                                >
                                    <i className="bi bi-cart-plus me-2"></i> Add to Cart
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default WishlistPage;