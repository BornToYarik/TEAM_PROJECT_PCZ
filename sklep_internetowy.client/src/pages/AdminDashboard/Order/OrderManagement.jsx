import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, ListGroup, InputGroup, FormControl } from 'react-bootstrap';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from '../../../components/admin/InvoiceGenerator/InvoiceDocument';

/**
 * @file OrderManagement.jsx
 * @brief Komponent panelu administracyjnego do kompleksowego zarzadzania zamowieniami.
 * @details Obsluguje pelny cykl zycia zamowienia (CRUD), w tym dynamiczna edycje listy produktow,
 * automatyczna korekte stanow magazynowych oraz generowanie faktur PDF.
 */

/**
 * @function OrderProductList
 * @description Komponent pomocniczy renderujacy uproszczona liste produktow w wierszu tabeli zamowien.
 * @param {Object[]} products - Tablica produktow wchodzacych w sklad zamowienia.
 */
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

/**
 * @function EditOrderProducts
 * @description Komponent interfejsu do dynamicznej edycji zawartosci produktow wewnatrz zamowienia.
 * @param {Object[]} products - Aktualna lista produktow w edytowanym zamowieniu.
 * @param {Function} setProducts - Funkcja aktualizujaca stan listy produktow.
 * @param {Object[]} allProducts - Pelna lista dostepnych produktow z bazy danych (do wyboru).
 */
function EditOrderProducts({ products, setProducts, allProducts }) {

    /**
     * @function handleQuantityChange
     * @description Aktualizuje ilosc konkretnego produktu w zamowieniu.
     * @param {number} productId - ID produktu.
     * @param {string|number} newQuantity - Nowa wartosc ilosci.
     */
    const handleQuantityChange = (productId, newQuantity) => {
        newQuantity = parseInt(newQuantity) || 0;
        setProducts(currentProducts =>
            currentProducts.map(p =>
                p.productId === productId ? { ...p, quantityInOrder: newQuantity } : p
            )
        );
    };

    /**
     * @function handleAddProduct
     * @description Dodaje nowy produkt do zamowienia na podstawie wyboru z listy.
     * @param {string|number} productId - Wybrane ID produktu.
     */
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

    /**
     * @function handleRemoveProduct
     * @description Usuwa produkt z aktualnie edytowanej listy zamowienia.
     * @param {number} productId - ID produktu do usuniecia.
     */
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

/**
 * @component OrderManagement
 * @description Glowny widok administracyjny zarzadzania zamowieniami.
 * @details Integruje operacje pobierania danych, walidacji stanow magazynowych oraz obslugi procesow CRUD.
 */
function OrderManagement() {
    /** @brief Lista wszystkich zamowien pobrana z API. */
    const [orders, setOrders] = useState([]);
    /** @brief Katalog produktow uzywany do walidacji i dodawania pozycji. */
    const [allProducts, setAllProducts] = useState([]);
    /** @brief Lista uzytkownikow do przypisania przy tworzeniu recznym zamowienia. */
    const [allUsers, setAllUsers] = useState([]);

    /** @brief Flaga okreslajaca stan ladowania danych. */
    const [loading, setLoading] = useState(true);
    /** @brief Przechowuje komunikaty o bledach operacji asynchronicznych. */
    const [error, setError] = useState(null);

    /** @brief Stany widocznosci okien modalnych. */
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    /** @brief Dane zamowienia bedacego w procesie edycji (gleboka kopia). */
    const [editingOrder, setEditingOrder] = useState(null);
    /** @brief Stan inicjalny dla nowego zamowienia. */
    const [newOrder, setNewOrder] = useState({ userId: '', products: [] });

    /** @effect Pobiera dane startowe (zamowienia, produkty, uzytkownicy) przy montowaniu komponentu. */
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

    /**
     * @function refreshOrders
     * @async
     * @description Odswieza liste zamowien z serwera.
     */
    const refreshOrders = async () => {
        try {
            const ordersRes = await fetch('/api/Orders');
            setOrders(await ordersRes.json());
        } catch (err) { setError(err.message); }
    }

    /**
     * @function refreshProducts
     * @async
     * @description Odswieza stany magazynowe produktow w lokalnym katalogu.
     */
    const refreshProducts = async () => {
        try {
            const productsRes = await fetch('/api/panel/Product');
            if (productsRes.ok) {
                setAllProducts(await productsRes.json());
            }
        } catch (err) { console.error("Failed to refresh products", err); }
    }

    /**
     * @function handleEdit
     * @description Inicjuje tryb edycji zamowienia, tworzac kopie obiektu w celu unikniecia bezposredniej mutacji.
     * @param {Object} order - Obiekt zamowienia do edycji.
     */
    const handleEdit = (order) => {
        const orderCopy = JSON.parse(JSON.stringify(order));
        setEditingOrder(orderCopy);
        setShowEditModal(true);
    };

    /**
     * @function handleEditFieldChange
     * @description Aktualizuje proste pola tekstowe (np. status) w edytowanym zamowieniu.
     */
    const handleEditFieldChange = (field, value) => {
        setEditingOrder(current => ({ ...current, [field]: value }));
    };

    /**
     * @function handleEditProductsChange
     * @description Uniwersalny handler zmian w liscie produktow dla edytowanego zamowienia.
     */
    const handleEditProductsChange = (updater) => {
        setEditingOrder(currentOrder => {
            const newProductList = typeof updater === 'function'
                ? updater(currentOrder.products)
                : updater;

            return { ...currentOrder, products: newProductList };
        });
    };

    /**
     * @function handleShowCreateModal
     * @description Otwiera formularz tworzenia nowego zamowienia z domyslnym uzytkownikiem.
     */
    const handleShowCreateModal = () => {
        setNewOrder({ userId: allUsers[0]?.id || '', products: [] });
        setShowCreateModal(true);
    };

    /**
     * @function handleCreateOrder
     * @async
     * @description Wysyla zadanie utworzenia nowego zamowienia do API i odswieza dane.
     */
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
            await refreshProducts();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function saveChanges
     * @async
     * @description Zapisuje zmiany w istniejacym zamowieniu (status, produkty) po walidacji stanu.
     */
    const saveChanges = async () => {
        if (!editingOrder) return;
        const updateDto = {
            status: editingOrder.status,
            products: editingOrder.products.map(p => ({
                productId: p.productId,
                quantity: p.quantityInOrder
            }))
        };

        // Walidacja stanow magazynowych przed wysylka (uwzgledniajac obecna rezerwacje)
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
            await refreshProducts();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function confirmDelete
     * @async
     * @description Usuwa zamowienie i wywoluje proces przywrocenia stanow magazynowych na serwerze.
     */
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
            await refreshOrders();
            await refreshProducts();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * @function handleCloseModal
     * @description Zamyka wszystkie otwarte okna modalne i resetuje stany robocze.
     */
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

            {/* button (C)REATE */}
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
                                <div className="d-flex gap-2">
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(order)}>
                                        <i className="bi bi-pencil-fill"></i> edit
                                    </Button>{' '}
                                    <Button variant="danger" size="sm" onClick={() => { setEditingOrder(order); setShowDeleteModal(true); }}>
                                        <i className="bi bi-trash-fill"></i> del.
                                    </Button>
                                    <PDFDownloadLink
                                        document={<InvoiceDocument order={order} />}
                                        fileName={`faktura_${order.id}.pdf`}
                                        className="btn btn-sm btn-info text-white"
                                    >
                                        {({ loading }) =>
                                            loading ? '...' : <i className="bi bi-file-earmark-pdf-fill"></i>
                                        }
                                    </PDFDownloadLink>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* --- (C)REATE MODAL --- */}
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

            {/* --- (U)PDATE MODAL --- */}
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

            {/* --- (D)ELETE MODAL --- */}
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