import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, ListGroup, InputGroup, FormControl } from 'react-bootstrap';

// --- (R)ead:
function OrderProductList({ products }) {
    if (!products || products.length === 0) {
        return <small className="text-muted">No products</small>;
    }
    return (
        <ul className="list-unstyled mb-0" style={{ fontSize: '0.9em' }}>
            {products.map(p => (
                <li key={p.productId}>
                    {p.quantityInOrder} x {p.name}
                </li>
            ))}
        </ul>
    );
}

// --- (U)pdate & (C)reate
function EditOrderProducts({ products, setProducts, allProducts }) {

    const handleQuantityChange = (productId, newQuantity) => {
        newQuantity = parseInt(newQuantity) || 0;
        setProducts(currentProducts =>
            currentProducts.map(p =>
                p.productId === productId ? { ...p, quantityInOrder: newQuantity } : p
            )
        );
    };

    const handleAddProduct = (productId) => {
        if (!productId || productId === "0") return;
        productId = parseInt(productId);
        if (products.some(p => p.productId === productId)) return;

        const productToAdd = allProducts.find(p => p.id === productId);
        if (!productToAdd) return;

        setProducts(currentProducts => [
            ...currentProducts,
            {
                productId: productToAdd.id,
                name: productToAdd.name,
                quantityInOrder: 1,
                quantityInStock: productToAdd.quantity,
                price: productToAdd.price
            }
        ]);
    };

    const handleRemoveProduct = (productId) => {
        setProducts(currentProducts =>
            currentProducts.filter(p => p.productId !== productId)
        );
    };

    return (
        <ListGroup className="mb-3">
            {products.map(p => (
                <ListGroup.Item key={p.productId}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{p.name}</strong><br />
                            <small className="text-muted">In stock: {p.quantityInStock}</small>
                        </div>
                        <Button variant="outline-danger" size="sm" onClick={() => handleRemoveProduct(p.productId)}>
                            <i className="bi bi-trash-fill"></i>
                        </Button>
                    </div>
                    <InputGroup className="mt-2">
                        <InputGroup.Text>Quantity:</InputGroup.Text>
                        <FormControl
                            type="number"
                            value={p.quantityInOrder}
                            onChange={(e) => handleQuantityChange(p.productId, e.target.value)}
                            min="0"
                            max={p.quantityInStock + p.quantityInOrder} 
                        />
                    </InputGroup>
                    {(p.quantityInOrder > p.quantityInStock + p.quantityInOrder) &&
                        <Alert variant="danger" className="mt-2 p-2">Out of stock!</Alert>
                    }
                </ListGroup.Item>
            ))}
            <InputGroup className="mt-3">
                <Form.Select onChange={(e) => handleAddProduct(e.target.value)}>
                    <option value="0">Add product...</option>
                    {allProducts.map(p => (
                        <option key={p.id} value={p.id} disabled={products.some(op => op.productId === p.id) || p.quantity === 0}>
                            {p.name} (In stock: {p.quantity})
                        </option>
                    ))}
                </Form.Select>
            </InputGroup>
        </ListGroup>
    );
}

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]); 

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [editingOrder, setEditingOrder] = useState(null);
    const [newOrder, setNewOrder] = useState({ userId: '', products: [] }); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, productsRes, usersRes] = await Promise.all([
                    fetch('/api/Orders'),  
                    fetch('/api/panel/Product'),
                    fetch('/api/Users')    
                ]);

                if (!ordersRes.ok || !productsRes.ok || !usersRes.ok) {
                    throw new Error('Failed to fetch initial data');
                }

                setOrders(await ordersRes.json());
                setAllProducts(await productsRes.json());
                setAllUsers(await usersRes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const refreshOrders = async () => {
        try {
            const ordersRes = await fetch('/api/Orders');
            setOrders(await ordersRes.json());
        } catch (err) { setError(err.message); }
    }

    // --- (U)pdate ---
    const handleEdit = (order) => {
        const orderCopy = JSON.parse(JSON.stringify(order));
        setEditingOrder(orderCopy);
        setShowEditModal(true);
    };
    const handleEditFieldChange = (field, value) => {
        setEditingOrder(current => ({ ...current, [field]: value }));
    };
    const handleEditProductsChange = (updater) => {
        setEditingOrder(currentOrder => {
            const newProductList = typeof updater === 'function'
                ? updater(currentOrder.products) 
                : updater; 

            return { ...currentOrder, products: newProductList };
        });
    };

    // --- (C)reate ---
    const handleShowCreateModal = () => { 
        setNewOrder({ userId: allUsers[0]?.id || '', products: [] });
        setShowCreateModal(true);
    };

    const handleCreateOrder = async () => {
        const createDto = {
            userId: newOrder.userId,
            products: newOrder.products.map(p => ({
                productId: p.productId,
                quantity: p.quantityInOrder
            }))
        };

        if (!createDto.userId) { setError("User must be selected"); return; }
        if (createDto.products.length === 0) { setError("Order cannot be empty"); return; }

        try {
            const response = await fetch('/api/Orders', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createDto)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to create order');
            }
            await refreshOrders();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    // --- (U)pdate (Save) ---
    const saveChanges = async () => { 
        if (!editingOrder) return;
        const updateDto = {
            status: editingOrder.status,
            products: editingOrder.products.map(p => ({
                productId: p.productId,
                quantity: p.quantityInOrder
            }))
        };

        const stockError = editingOrder.products.find(p => p.quantityInOrder > p.quantityInStock + (orders.find(o => o.id === editingOrder.id)?.products.find(op => op.productId === p.productId)?.quantityInOrder || 0));
        if (stockError) {
            setError(`Not enough stock for ${stockError.name}!`);
            return;
        }

        try {
            const response = await fetch(`/api/Orders/${editingOrder.id}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateDto)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update order');
            }
            await refreshOrders();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    // --- (D)elete ---
    const confirmDelete = async () => { 
        if (!editingOrder) return;
        try {
            const response = await fetch(`/api/Orders/${editingOrder.id}`, { 
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete order');
            }
            setOrders(current => current.filter(o => o.id !== editingOrder.id));
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };
    const handleCloseModal = () => { 
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowCreateModal(false);
        setEditingOrder(null);
        setNewOrder({ userId: '', products: [] });
        setError(null);
    };

    if (loading) {
        return <Container fluid className="p-4"><Spinner animation="border" /></Container>;
    }

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Order Management</h2>
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            {/* КНОПКА (C)REATE */}
            <Button variant="success" className="mb-3" onClick={handleShowCreateModal}>
                <i className="bi bi-plus-circle-fill"></i> Create New Order
            </Button>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.userEmail}</td>
                            <td><OrderProductList products={order.products} /></td>
                            <td>{order.status}</td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => handleEdit(order)}>
                                    <i className="bi bi-pencil-fill"></i> edit
                                </Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => { setEditingOrder(order); setShowDeleteModal(true); }}>
                                    <i className="bi bi-trash-fill"></i> del.
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* --- Модальное окно (C)REATE --- */}
            <Modal show={showCreateModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Select User</Form.Label>
                            <Form.Select
                                value={newOrder.userId}
                                onChange={(e) => setNewOrder(o => ({ ...o, userId: e.target.value }))}
                            >
                                <option value="">Select a user...</option>
                                {allUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.email}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Label>Products in Order</Form.Label>
                        <EditOrderProducts
                            products={newOrder.products}
                            setProducts={(updater) => {
                                setNewOrder(currentOrder => {
                                    const newProductList = typeof updater === 'function'
                                        ? updater(currentOrder.products) 
                                        : updater;

                                    return { ...currentOrder, products: newProductList };
                                });
                            }}
                            allProducts={allProducts}
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="success" onClick={handleCreateOrder}>Create Order</Button>
                </Modal.Footer>
            </Modal>

            {/* --- Модальное окно (U)pdate --- */}
            {editingOrder && (
                <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Order #{editingOrder.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Client</Form.Label>
                                <Form.Control type="text" value={editingOrder.userEmail} readOnly disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={editingOrder.status}
                                    onChange={(e) => handleEditFieldChange('status', e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Label>Products in order</Form.Label>
                            <EditOrderProducts
                                products={editingOrder.products}
                                setProducts={handleEditProductsChange}
                                allProducts={allProducts}
                            />
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" onClick={saveChanges}>Save Changes</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* --- Модальное окно (D)elete --- */}
            <Modal show={showDeleteModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Delete order #{editingOrder?.id}? Products will return to warehouse.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default OrderManagement;