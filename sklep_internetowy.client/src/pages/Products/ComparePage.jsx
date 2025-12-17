import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Image, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; 
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

function ComparePage({ comparison }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { addToCart } = useCart();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchCompareProducts = async () => {

            if (comparison.compareItems.length === 0) {
                setProducts([]);
                return;
            }

            setLoading(true);
            setError('');

            try {

                const response = await fetch('/api/panel/Product/compare-list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(comparison.compareItems),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch products for comparison');
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error(err);
                setError('Could not load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCompareProducts();
    }, [comparison.compareItems]);


    const renderPrice = (product) => {
        if (product.hasActiveDiscount) {
            return (
                <div>
                    <span className="text-danger fw-bold">{product.finalPrice.toFixed(2)} zl</span>
                    <br />
                    <small className="text-muted text-decoration-line-through">
                        {product.price.toFixed(2)} zl
                    </small>
                    <Badge bg="danger" className="ms-2">
                        -{product.discountPercentage}%
                    </Badge>
                </div>
            );
        }
        return <span className="fw-bold">{product.price.toFixed(2)} zl</span>;
    };


    if (comparison.compareItems.length === 0) {
        return (
            <Container className="my-5 text-center">
                <h2>No products to compare</h2>
                <p className="text-muted">Add products from the shop to see them here.</p>
                <Button variant="primary" onClick={() => navigate('/')}>
                    Go to Shop
                </Button>
            </Container>
        );
    }


    if (loading && products.length === 0) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading comparison...</p>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Compare Products</h1>
                <Button variant="outline-secondary" onClick={() => comparison.clearComparison()}>
                    Clear All
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {products.length > 0 && (
                <div className="table-responsive">
                    <Table bordered hover className="text-center align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: '20%' }} className="text-start">Feature</th>
                                {products.map(product => (
                                    <th key={product.id} style={{ width: `${80 / products.length}%` }}>
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="link"
                                                className="text-danger p-0"
                                                onClick={() => comparison.removeCompareItem(product.id)}
                                                title="Remove"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                        <Image
                                            src="https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png" 
                                            alt={product.name}
                                            fluid
                                            style={{ maxHeight: '150px', objectFit: 'contain' }}
                                            className="mb-2"
                                        />
                                        <h5>{product.name}</h5>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                         
                            <tr>
                                <td className="fw-bold text-start bg-light">Price</td>
                                {products.map(product => (
                                    <td key={product.id}>{renderPrice(product)}</td>
                                ))}
                            </tr>

                            <tr>
                                <td className="fw-bold text-start bg-light">Category</td>
                                {products.map(product => (
                                    <td key={product.id}>
                                        <Badge bg="info" text="dark">
                                            {product.productCategoryName || 'Uncategorized'}
                                        </Badge>
                                    </td>
                                ))}
                            </tr>

                            
                            <tr>
                                <td className="fw-bold text-start bg-light">Availability</td>
                                {products.map(product => (
                                    <td key={product.id}>
                                        {product.quantity > 0 ? (
                                            <span className="text-success fw-bold">In Stock ({product.quantity})</span>
                                        ) : (
                                            <span className="text-danger fw-bold">Out of Stock</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                           
                            <tr>
                                <td className="fw-bold text-start bg-light">Description</td>
                                {products.map(product => (
                                    <td key={product.id} className="small text-muted">
                                        {product.description?.substring(0, 100)}
                                        {product.description?.length > 100 && '...'}
                                    </td>
                                ))}
                            </tr>

                            
                            <tr>
                                <td className="text-start bg-light">Action</td>
                                {products.map(product => (
                                    <td key={product.id}>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            disabled={product.quantity <= 0}
                                            onClick={() => addToCart(product)}
                                        >
                                            <ShoppingCart size={16} className="me-1" />
                                            Add to Cart
                                        </Button>
                                        <br />
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="mt-2 text-decoration-none"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}

            <div className="mt-4">
                <Button variant="secondary" onClick={() => navigate(-1)} className="d-flex align-items-center gap-2">
                    <ArrowLeft size={18} /> Back
                </Button>
            </div>
        </Container>
    );
}

export default ComparePage;