import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';

function OrderManagement() {
    const [orders, setOrders] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingStatus, setEditingStatus] = useState('');
    useEffect(() => {
        // TODO: fetch order for ASP.NET API
        // fetch('/api/orders')
        //   .then(res => res.json())
        //   .then(data => setOrders(data));

        setOrders([
            { id: 1, userId: 101, status: 'Processing' },
            { id: 2, userId: 102, status: 'Shipped' },
        ]);
    }, []);

    const handleEdit = (order) => {
        setSelectedOrder(order);
        setEditingStatus(order.status);
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
        setEditingStatus('');
    };

    const saveChanges = () => {
        // TODO: logika wysylania PUT/PATCH zapytania /api/orders/{selectedOrder.id}
        console.log('Saving... ID:', selectedOrder.id, 'New Status:', editingStatus);
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === selectedOrder.id
                    ? { ...order, status: editingStatus } 
                    : order 
            )
        );
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
                        <th>Order Id</th>
                        <th>User Id</th>
                        <th>status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.orderId}</td>
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
                            <Form.Select
                                value={editingStatus}
                                onChange={(e) => setEditingStatus(e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>User ID (read-only)</Form.Label>
                            <Form.Control type="text" value={selectedOrder?.userId} readOnly disabled />
                        </Form.Group>
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