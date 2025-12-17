import React, { useState } from 'react';
import { RefreshCw, Clock, Zap } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const MIN_STOCK_LEVEL = 10;
const DAYS_SINCE_LAST_SALE = 60;
const PROMOTION_PERCENTAGE = 15;
const PROMOTION_DURATION_DAYS = 14;


const PromotionManagement = () => {
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
    const API_URL = '/api/panel/Promotion';

    const runPromotionTask = async (endpoint) => {
        setLoading(true);
        setStatusMessage({ message: '', type: '' });

        try {
            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage({
                    message: data.message || 'Promotion task executed successfully.',
                    type: 'success'
                });
            } else {
                const errorText = data.error || data.message || 'Unknown error occurred.';
                setStatusMessage({
                    message: `Operation failed: ${errorText}`,
                    type: 'danger'
                });
                console.error(`Promotion error (${endpoint}):`, data);
            }
        } catch (err) {
            setStatusMessage({
                message: 'Server connection error. Check if the backend is running.',
                type: 'danger'
            });
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 d-flex align-items-center gap-3">
                <Zap size={32} className="text-primary" /> Dynamic Promotion Management
            </h1>
            <p className="text-muted">
                Manually trigger automatic discount tasks based on product stock and sales performance.
            </p>

            {statusMessage.message && (
                <div className={`alert alert-${statusMessage.type} alert-dismissible fade show`} role="alert">
                    {statusMessage.message}
                    <button type="button" className="btn-close" onClick={() => setStatusMessage({ message: '', type: '' })}></button>
                </div>
            )}

            {loading && (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-primary">Processing request...</p>
                </div>
            )}

            <div className="row g-4 mt-3">

                <div className="col-md-6">
                    <div className="card h-100 shadow-sm border-success">
                        <div className="card-body">
                            <h5 className="card-title d-flex align-items-center gap-2">
                                <RefreshCw size={20} className="text-success" />
                                Apply Stock Clearance Discounts
                            </h5>
                            <p className="card-text">
                                Identifies products with high stock ({MIN_STOCK_LEVEL} units) and low sales (no sales for &gt;{DAYS_SINCE_LAST_SALE} days) and applies a {PROMOTION_PERCENTAGE}% discount for {PROMOTION_DURATION_DAYS} days.                            </p>
                            <button
                                className="btn btn-success w-100 mt-3"
                                onClick={() => runPromotionTask('apply-discounts')}
                                disabled={loading}
                            >
                                Run Promotion Now
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card h-100 shadow-sm border-warning">
                        <div className="card-body">
                            <h5 className="card-title d-flex align-items-center gap-2">
                                <Clock size={20} className="text-warning" />
                                Remove Expired Discounts
                            </h5>
                            <p className="card-text">
                                Checks all products and removes discounts that have passed their `DiscountEndDate`. This ensures prices return to normal after the promotion period.
                            </p>
                            <button
                                className="btn btn-warning w-100 mt-3 text-white"
                                onClick={() => runPromotionTask('remove-expired')}
                                disabled={loading}
                            >
                                Clean Up Expired Discounts
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PromotionManagement;