import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../../utils/authUtils';
// Importujemy funkcję sprawdzającą, czy jest adminem

// Komponent przyjmuje teraz właściwość 'compareCount'
function Navbar({ compareCount }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location.pathname.startsWith('/search')) {
            setSearchQuery('');
        }
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            setIsUserAdmin(isAdmin());
        } else {
            setIsLoggedIn(false);
            setIsUserAdmin(false);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setIsUserAdmin(false);
        navigate("/login");
    };

    // Ustawiamy domyślną wartość na 0, jeśli props nie został przekazany
    const currentCompareCount = compareCount || 0;
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
            <nav className="navbar navbar-dark bg-dark py-3 shadow">
                <div className="container">
                    <Link className="navbar-brand fw-bold fs-3" to="/">
                        <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                        TechStore
                    </Link>

                    {isLoggedIn && isUserAdmin && (
                        <Link className="btn btn-outline-warning btn-sm" to="/admin">
                            <i className="bi bi-speedometer2 me-1"></i>
                            Admin Dashboard
                        </Link>
                    )}

                    <div className="d-flex align-items-center gap-4">
                        <form className="input-group" style={{ width: '400px' }} onSubmit={handleSearchSubmit}>
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
                            <button className="btn btn-warning" type="submit">
                                Search
                            </button>
                        </form>


                        {/* WSKAŹNIK PORÓWNYWANIA PRODUKTÓW */}
                        <Link
                            to="/compare"
                            className="position-relative text-white text-decoration-none"
                            // Zmieniamy kolor na niebieski (info), jeśli są produkty do porównania
                            style={{ transition: 'all 0.2s ease', color: currentCompareCount > 0 ? '#17a2b8' : 'white' }}
                        >
                            <i className="bi bi-shuffle fs-4"></i> {/* Ikona Porównywania */}
                            {currentCompareCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info">
                                    {currentCompareCount}
                                </span>
                            )}
                        </Link>
                        {/* KONIEC WSKAŹNIKA PORÓWNYWANIA */}


                        <Link
                            to="/cart"
                            className="position-relative text-white text-decoration-none"
                            style={{ transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ffc107';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'white';
                            }}
                        >
                            <i className="bi bi-cart4 fs-4"></i>
                        </Link>

                        {isLoggedIn ? (
                            <div className="d-flex gap-2">
                                <Link to="/profile" className="btn btn-outline-light btn-sm">
                                    <i className="bi bi-person-gear me-1"></i>
                                    Profile
                                </Link>

                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right me-1"></i>
                                    Logout
                                </button>
                            </div>

                        ) : (
                            <Link className="btn btn-outline-light btn-sm" to="/login">
                                <i className="bi bi-person-circle me-1"></i>
                                Login
                            </Link>
                        )}

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