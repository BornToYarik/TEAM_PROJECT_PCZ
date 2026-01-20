import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { pdf } from '@react-pdf/renderer';
import InvoiceDocument from '../../components/admin/InvoiceGenerator/InvoiceDocument';

export default function AuctionPayment() {
    const { auctionId } = useParams();
    const navigate = useNavigate();

    const [auctionWinner, setAuctionWinner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [processing, setProcessing] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        const loadAuctionWinner = async () => {
            try {
                const response = await fetch(`/api/auction-winner/${auctionId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) throw new Error('Auction data not found');

                const data = await response.json();
                setAuctionWinner(data);
                setIsPaid(data.isPaid);
            } catch (err) {
                setStatus({ type: 'danger', msg: err.message });
            } finally {
                setLoading(false);
            }
        };

        loadAuctionWinner();
    }, [auctionId]);

    const downloadInvoice = async (orderData) => {
        try {
            const blob = await pdf(<InvoiceDocument order={orderData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `auction_invoice_${orderData.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF generation error", error);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);

        try {
            const response = await fetch(`/api/auction-winner/${auctionId}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Payment failed');
            }

            const orderData = await response.json();

            await downloadInvoice(orderData);

            setStatus({
                type: 'success',
                msg: 'Payment completed successfully! The invoice has been downloaded.'
            });

            setIsPaid(true);
            setTimeout(() => navigate('/order-history'), 2000);

        } catch (err) {
            setStatus({ type: 'danger', msg: err.message });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!auctionWinner) {
        return (
            <div className="container mt-5">
                <Alert variant="danger">You do not have access to this payment</Alert>
            </div>
        );
    }

    if (isPaid) {
        return (
            <div className="container py-5">
                <div className="card shadow-sm border-success">
                    <div className="card-body text-center p-5">
                        <i className="bi bi-check-circle-fill text-success display-1 mb-4"></i>
                        <h2 className="text-success mb-3">This auction has already been paid</h2>
                        <p className="text-muted">Check your order history</p>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/order-history')}
                        >
                            Go to order history
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Congratulations! You won the auction</h3>
                        </div>

                        <div className="card-body">
                            {status.msg && <Alert variant={status.type}>{status.msg}</Alert>}

                            <div className="mb-4">
                                <h5 className="border-bottom pb-2">Product details</h5>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        <h6 className="mb-1">{auctionWinner.productName}</h6>
                                        <small className="text-muted">Quantity: 1 item</small>
                                    </div>
                                    {auctionWinner.productImage && (
                                        <img
                                            src={auctionWinner.productImage}
                                            alt={auctionWinner.productName}
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                            className="rounded"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="border-bottom pb-2">Auction details</h5>
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Winning date:</span>
                                        <strong>
                                            {new Date(auctionWinner.wonAt).toLocaleString('en-US')}
                                        </strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Your winning bid:</span>
                                        <strong className="text-success fs-4">
                                            {auctionWinner.winningAmount} $
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-light p-3 rounded mb-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Total to pay:</h5>
                                    <h3 className="mb-0 text-primary">
                                        {auctionWinner.winningAmount} $
                                    </h3>
                                </div>
                            </div>

                            <button
                                className="btn btn-success w-100 py-3"
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Processing payment...
                                    </>
                                ) : (
                                    'Pay & download invoice'
                                )}
                            </button>

                            <p className="text-center text-muted mt-3 small">
                                The invoice will be downloaded automatically after payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
