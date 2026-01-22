import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useWishlist } from '../../context/WishListContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

/**
 * @file WishlistPage.jsx
 * @brief Komponent strony listy zyczen (ulubionych produktow).
 * @details Modul umozliwia uzytkownikowi przegladanie produktow zapisanych "na pozniej", 
 * usuwanie ich z listy oraz szybkie dodawanie wybranych pozycji do koszyka zakupowego.
 */

/**
 * @component WishlistPage
 * @description Renderuje widok kolekcji ulubionych produktow. Zarzadza wyswietlaniem 
 * stanu pustego oraz dynamicznej siatki kart produktow pobranych z WishlistContext.
 */
function WishlistPage() {
    /** @brief Pobranie danych i funkcji sterujacych z kontekstu listy zyczen. */
    const { wishlist, toggleWishlist } = useWishlist();
    /** @brief Funkcja dodawania produktu do koszyka pobrana z CartContext. */
    const { addToCart } = useCart();

    /** @brief Adres URL domyslnego obrazu uzywanego w przypadku braku zdjec produktu. */
    const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png";

    /** * @section EmptyState
     * Obsluga wyswietlania komunikatu w przypadku braku produktow na liscie.
     */
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
                {wishlist.map(product => {
                    /** @brief Logika wyboru glownego zdjecia produktu. */
                    const mainImage = (product.imageUrls && product.imageUrls.length > 0)
                        ? product.imageUrls[0]
                        : DEFAULT_IMAGE;

                    return (
                        <Col key={product.id} md={3} sm={6} className="mb-4">
                            <Card className="h-100 shadow-sm border-0">
                                <div className="position-relative">
                                    <Card.Img
                                        variant="top"
                                        src={mainImage}
                                        alt={product.name}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    {/* Przycisk usuwania z listy zyczen */}
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

                                    {/* Akcja dodawania do koszyka */}
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
                    );
                })}
            </Row>
        </Container>
    );
}

export default WishlistPage;