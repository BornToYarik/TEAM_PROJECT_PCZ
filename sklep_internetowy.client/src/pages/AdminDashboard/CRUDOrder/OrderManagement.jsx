import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';

function OrderManagement() {
    const [orders, setOrders] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        // TODO: fetch order for ASP.NET API
        // fetch('/api/orders')
        //   .then(res => res.json())
        //   .then(data => setOrders(data));

        setOrders([
            { id: 1, customerName: 'Ben Dover', total: 1500, status: 'Processing' },
            { id: 2, customerName: 'Ala Nowak', total: 4200, status: 'Shipped' },
        ]);
    }, []);

    const handleEdit = (order) => {
        setSelectedOrder(order);
        setShowEditModal(true);
    };

    const handleDelete = (order) => {
        setSelectedOrder(order);
        setShowDeleteModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedOrder(null);
    };

    const saveChanges = () => {
        // TODO: logika wysylania PUT/PATCH zapytania /api/orders/{selectedOrder.id}
        console.log('Saving...', selectedOrder);
        handleCloseModal();
    };

    const confirmDelete = () => {
        // TODO: logika wysylania DELETE zapytania /api/orders/{selectedOrder.id}
        console.log('Deleting...', selectedOrder.id);

        setOrders(orders.filter(o => o.id !== selectedOrder.id));
        handleCloseModal();
    };


    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Order managment</h2>

            {/* TODO: button for create order */}
            {/* <Button variant="success" className="mb-3">Create order</Button> */}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Order id</th>
                        <th>client</th>
                        <th>price</th>
                        <th>status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.customerName}</td>
                            <td>{order.total} ₽</td>
                            <td>{order.status}</td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => handleEdit(order)}>
                                    <i className="bi bi-pencil-fill"></i> edit
                                </Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => handleDelete(order)}>
                                    <i className="bi bi-trash-fill"></i> del.
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* komponent (U)pdate */}
            <Modal show={showEditModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit order #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Order status</Form.Label>
                            {/* Here update selectedOrder by set... */}
                            <Form.Control type="text" defaultValue={selectedOrder?.status} />
                        </Form.Group>
                        {/* ...inne pola do redakcju... */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={saveChanges}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* komponent (D)elete */}
            <Modal show={showDeleteModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm deleting</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Delete order #{selectedOrder?.id}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default OrderManagement;