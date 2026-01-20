import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyAuctionWins() {
    const [wins, setWins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWins();
    }, []);

    const loadWins = async () => {
        try {
            const response = await fetch('/api/auction-winner/my-wins', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWins(data);
            }
        } catch (err) {
            console.error('Error loading wins:', err);
        } finally {
            setLoading(false);
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

    return (
        <div className="container my-4">
            <h2 className="mb-4">My Auction Wins</h2>

            {wins.length === 0 ? (
                <div className="alert alert-info">
                    You haven’t won any auctions yet
                </div>
            ) : (
                <div className="row g-4">
                    {wins.map(win => (
                        <div key={win.auctionId} className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src={win.productImage || '/placeholder.png'}
                                    alt={win.productName}
                                    className="card-img-top"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{win.productName}</h5>

                                    <div className="mb-2">
                                        <small className="text-muted">Winning amount</small>
                                        <h4 className="text-success mb-0">{win.winningAmount} PLN</h4>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted">
                                            Won on: {new Date(win.wonAt).toLocaleDateString('en-US')}
                                        </small>
                                    </div>

                                    {win.isPaid ? (
                                        <div className="alert alert-success py-2 mb-2">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            Paid
                                        </div>
                                    ) : (
                                        <Link
                                            to={`/auction-payment/${win.auctionId}`}
                                            className="btn btn-primary w-100"
                                        >
                                            Pay now
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
