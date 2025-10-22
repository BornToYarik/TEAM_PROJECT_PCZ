import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            <nav className="navbar navbar-dark bg-dark py-3 shadow">
                <div className="container">
                    <Link className="navbar-brand fw-bold fs-3" to="/">
                        <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                        TechStore
                    </Link>

                    <Link className="btn btn-outline-warning btn-sm" to="/admin">
                        <i className="bi bi-speedometer2 me-1"></i>
                        Admin Dashboard
                    </Link>

                    <div className="d-flex align-items-center gap-4">
                        <div className="input-group" style={{ width: '400px' }}>
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                className="form-control border-start-0"
                                type="search"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-warning" type="button">
                                Search
                            </button>
                        </div>

                        <Link className="text-white text-decoration-none" to="/cart">
                            <i className="bi bi-cart3 fs-4 position-relative">
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.55rem' }}>3</span>
                            </i>
                        </Link>

                        <Link className="btn btn-outline-light btn-sm" to="/login">
                            <i className="bi bi-person-circle me-1"></i>
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                <div className="container">
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav mx-auto gap-4">
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold" to="/laptops">
                                    <i className="bi bi-laptop me-1"></i>
                                    Laptops
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold" to="/computers">
                                    <i className="bi bi-pc-display me-1"></i>
                                    Computers
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold" to="/smartphones">
                                    <i className="bi bi-phone me-1"></i>
                                    Smartphones
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold" to="/gaming">
                                    <i className="bi bi-controller me-1"></i>
                                    Gaming
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold" to="/accessories">
                                    <i className="bi bi-usb-drive me-1"></i>
                                    Accessories
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold text-danger" to="/deals">
                                    <i className="bi bi-tag-fill me-1"></i>
                                    Deals
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;