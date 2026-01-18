import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../../utils/authUtils';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

function Navbar({ compareCount }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState({ categories: [], products: [] });
    const [showDropdown, setShowDropdown] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    const { theme, toggleTheme, fontSize, toggleFontSize } = useTheme();

    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const { wishlist } = useWishlist();
    const { totalItems } = useCart();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setIsUserAdmin(false);
        navigate("/login");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length > 1) {
                try {
                    const response = await fetch(`/api/panel/Product/suggestions?q=${searchQuery}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSuggestions(data);
                        setShowDropdown(true);
                    }
                } catch (err) {
                    console.error("Search fetch error", err);
                }
            } else {
                setShowDropdown(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const currentCompareCount = compareCount || 0;

    return (
        <>
            <nav className="navbar navbar-dark bg-dark py-3 shadow">
                <div className="container">
                    <div className="d-flex align-items-center gap-3">
                        <Link className="navbar-brand fw-bold fs-3" to="/">
                            <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                            TechStore
                        </Link>

                        {isLoggedIn && isUserAdmin && (
                            <Link className="btn btn-outline-warning btn-sm" to="/admin">
                                <i className="bi bi-speedometer2 me-1"></i>
                                Admin
                            </Link>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-4">
                        <div className="position-relative" ref={dropdownRef}>
                            <form className="input-group" style={{ width: '400px' }} onSubmit={handleSearchSubmit}>
                                <input
                                    className="form-control border-0 shadow-none"
                                    type="search"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length > 1 && setShowDropdown(true)}
                                />
                                <button className="btn btn-warning" type="submit">
                                    <i className="bi bi-search"></i>
                                </button>
                            </form>

                            {showDropdown && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                                <div className="position-absolute bg-white shadow-lg rounded-3 mt-2 d-flex"
                                    style={{ width: '550px', zIndex: 1050, border: '1px solid #dee2e6', left: 0 }}>
                                    <div className="p-3 border-end" style={{ width: '40%', backgroundColor: '#f8f9fa' }}>
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Categories</label>
                                        <ul className="list-unstyled mb-0">
                                            {suggestions.categories.map((cat, idx) => (
                                                <li key={idx} className="mb-2">
                                                    <Link to={`/search?q=${cat}`} className="text-dark text-decoration-none small d-flex align-items-center" onClick={() => setShowDropdown(false)}>
                                                        <i className="bi bi-tag me-2 text-primary"></i> {cat}
                                                    </Link>
                                                </li>
                                            ))}
                                            {suggestions.categories.length === 0 && <span className="text-muted small">No categories found</span>}
                                        </ul>
                                    </div>

                                    <div className="p-3" style={{ width: '60%' }}>
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Suggested Products</label>
                                        {suggestions.products.map(product => (
                                            <div key={product.id}
                                                className="d-flex align-items-center p-2 mb-1 rounded item-row"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => { navigate(`/product/${product.id}`); setShowDropdown(false); }}>

                                                <div className="bg-light rounded d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                    <i className="bi bi-box text-secondary"></i>
                                                </div>

                                                <div className="overflow-hidden">
                                                    <div className="small fw-bold text-dark text-truncate">{product.name}</div>
                                                    <div className="text-success fw-bold small">{product.price.toFixed(2)} zl</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="d-flex align-items-center gap-3">

                            <div className="d-flex bg-secondary bg-opacity-25 rounded p-1">
                                <button
                                    onClick={toggleFontSize}
                                    className="btn btn-sm text-white"
                                    title="Toggle Font Size"
                                >
                                    {fontSize === 'normal'
                                        ? <i className="bi bi-file-font fs-5"></i>
                                        : <i className="bi bi-file-font-fill fs-4 text-warning"></i>
                                    }
                                </button>

                                <div className="vr bg-white mx-1"></div>

                                <button
                                    onClick={toggleTheme}
                                    className="btn btn-sm text-white"
                                    title="Toggle Dark Mode"
                                >
                                    {theme === 'light'
                                        ? <i className="bi bi-moon-stars fs-5"></i>
                                        : <i className="bi bi-sun-fill fs-5 text-warning"></i>
                                    }
                                </button>
                            </div>


                            <Link to="/compare" className="text-white position-relative text-decoration-none">
                                <i className="bi bi-shuffle fs-4"></i>
                                {currentCompareCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info" style={{ fontSize: '0.65rem' }}>
                                        {currentCompareCount}
                                    </span>
                                )}
                            </Link>

                            <Link to="/cart" className="text-white position-relative text-decoration-none">
                                <i className="bi bi-cart4 fs-4"></i>
                                {totalItems > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            <Link to="/wishlistpage" className="text-white position-relative text-decoration-none me-2">
                                <i className="bi bi-heart-fill" style={{ fontSize: '1.4rem' }}></i>
                                {wishlist.length > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>

                            {isLoggedIn ? (
                                <div className="d-flex gap-2 ms-2">
                                    <Link to="/profile" className="btn btn-outline-light btn-sm">Profile</Link>
                                    <button onClick={handleLogout} className="btn btn-warning btn-sm">Logout</button>
                                </div>
                            ) : (
                                <Link className="btn btn-outline-light btn-sm ms-2" to="/login">Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                <div className="container">
                    <ul className="navbar-nav mx-auto gap-4">
                        {['Laptops', 'Computers', 'Smartphones', 'Gaming', 'Accessories'].map(item => (
                            <li key={item} className="nav-item">
                                <Link className="nav-link fw-semibold" to={`/${item.toLowerCase()}`}>{item}</Link>
                            </li>
                        ))}
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold text-danger" to="/deals">Deals</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold text-danger" to="/auctions">
                                <i className="bi bi-tag-fill me-1"></i>
                                Auctions
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <style>{`
                .item-row:hover {
                    background-color: #f1f3f5;
                }
                .form-control:focus {
                    box-shadow: none;
                }
            `}</style>
        </>
    );
}

export default Navbar;