import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../../utils/authUtils';
import { useWishlist } from '../../context/WishListContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

/**
 * @file Navbar.jsx
 * @brief Komponent paska nawigacji aplikacji.
 * @details Odpowiada za wyswietlanie glownego menu, wyszukiwarki z podpowiedziami,
 * przelaczanie jezyka, motywu, rozmiaru czcionki oraz za obsluge stanu logowania uzytkownika.
 */

/**
 * @component Navbar
 * @brief Glowny komponent paska nawigacji.
 * @param {number} compareCount Liczba produktow w porownywarce.
 * @return JSX.Element Element paska nawigacji.
 */
function Navbar({ compareCount }) {

    /**
     * @brief Hook tlumaczen oraz obiektu konfiguracji jezyka.
     */
    const { t, i18n } = useTranslation();

    /**
     * @brief Aktualna wartosc zapytania wyszukiwania.
     */
    const [searchQuery, setSearchQuery] = useState('');

    /**
     * @brief Podpowiedzi wyszukiwania dla kategorii i produktow.
     */
    const [suggestions, setSuggestions] = useState({ categories: [], products: [] });

    /**
     * @brief Flaga okreslajaca widocznosc listy podpowiedzi.
     */
    const [showDropdown, setShowDropdown] = useState(false);

    /**
     * @brief Domyslny obrazek produktu uzywany gdy brak zdjecia.
     */
    const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png";

    /**
     * @brief Flaga informujaca czy uzytkownik jest zalogowany.
     */
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    /**
     * @brief Flaga informujaca czy uzytkownik posiada uprawnienia administratora.
     */
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    /**
     * @brief Kontekst motywu oraz rozmiaru czcionki.
     */
    const { theme, toggleTheme, fontSize, toggleFontSize } = useTheme();

    /**
     * @brief Hook do nawigacji pomiedzy stronami.
     */
    const navigate = useNavigate();

    /**
     * @brief Aktualna lokalizacja routingu.
     */
    const location = useLocation();

    /**
     * @brief Referencja do kontenera listy podpowiedzi wyszukiwania.
     */
    const dropdownRef = useRef(null);

    /**
     * @brief Lista produktow w liscie zyczen.
     */
    const { wishlist } = useWishlist();

    /**
     * @brief Lacznba liczba produktow w koszyku.
     */
    const { totalItems } = useCart();

    /**
     * @brief Zmienia aktualny jezyk aplikacji.
     * @param {string} lng Kod jezyka.
     */
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    /**
     * @brief Wylogowuje aktualnego uzytkownika.
     * @details Usuwa dane sesji z localStorage i przekierowuje na strone logowania.
     */
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setIsUserAdmin(false);
        navigate("/login");
    };

    /**
     * @brief Efekt odpowiedzialny za zamykanie listy podpowiedzi po kliknieciu poza nia.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * @brief Efekt pobierajacy podpowiedzi wyszukiwania z API.
     * @details Wysylany jest request po krotkim opoznieniu (debounce).
     */
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

    /**
     * @brief Efekt reagujacy na zmiane trasy.
     * @details Resetuje pole wyszukiwania oraz sprawdza stan logowania uzytkownika.
     */
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

    /**
     * @brief Obsluguje wyslanie formularza wyszukiwania.
     * @param {Event} e Zdarzenie formularza.
     */
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    /**
     * @brief Aktualna liczba produktow w porownywarce.
     */
    const currentCompareCount = compareCount || 0;

    /**
     * @brief Lista glownego menu kategorii.
     */
    const menuItems = ['laptops', 'computers', 'smartphones', 'gaming', 'accessories'];
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
                                {t('navbar.admin')}
                            </Link>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-4">
                        <div className="position-relative" ref={dropdownRef}>
                            <form className="input-group" style={{ width: '400px' }} onSubmit={handleSearchSubmit}>
                                <input
                                    className="form-control border-0 shadow-none"
                                    type="search"
                                    placeholder={t('navbar.searchPlaceholder')}
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
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">
                                            {t('navbar.categoriesHeader')}
                                        </label>
                                        <ul className="list-unstyled mb-0">
                                            {suggestions.categories.map((cat, idx) => (
                                                <li key={idx} className="mb-2">
                                                    <Link to={`/search?q=${cat}`} className="text-dark text-decoration-none small d-flex align-items-center" onClick={() => setShowDropdown(false)}>
                                                        <i className="bi bi-tag me-2 text-primary"></i> {cat}
                                                    </Link>
                                                </li>
                                            ))}
                                            {suggestions.categories.length === 0 && <span className="text-muted small">{t('navbar.noCategories')}</span>}
                                        </ul>
                                    </div>

                                    <div className="p-3" style={{ width: '60%' }}>
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">
                                            {t('navbar.suggestedProducts')}
                                        </label>
                                        {suggestions.products.map(product => (
                                            <div key={product.id}
                                                className="d-flex align-items-center p-2 mb-1 rounded item-row"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => { navigate(`/product/${product.id}`); setShowDropdown(false); }}>

                                                <img
                                                    src={(product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : DEFAULT_IMAGE}
                                                    alt={product.name}
                                                    className="rounded me-3"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                />

                                                <div className="overflow-hidden">
                                                    <div className="small fw-bold text-dark text-truncate">{product.name}</div>
                                                    <div className="text-success fw-bold small">
                                                        {product.price.toFixed(2)} {t('navbar.currency')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="d-flex align-items-center gap-3">

                            <div className="btn-group btn-group-sm">
                                <button
                                    className={`btn ${i18n.resolvedLanguage === 'pl' ? 'btn-light' : 'btn-outline-secondary text-white'}`}
                                    onClick={() => changeLanguage('pl')}
                                >
                                    PL
                                </button>
                                <button
                                    className={`btn ${i18n.resolvedLanguage === 'en' ? 'btn-light' : 'btn-outline-secondary text-white'}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    EN
                                </button>
                            </div>

                            <div className="d-flex bg-secondary bg-opacity-25 rounded p-1">
                                <button
                                    onClick={toggleFontSize}
                                    className="btn btn-sm text-white"
                                    title={t('navbar.tooltips.fontSize')}
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
                                    title={t('navbar.tooltips.darkMode')}
                                >
                                    {theme === 'light'
                                        ? <i className="bi bi-moon-stars fs-5"></i>
                                        : <i className="bi bi-sun-fill fs-5 text-warning"></i>
                                    }
                                </button>
                            </div>


                            <Link to="/compare" title={t('navbar.tooltips.compare')} className="text-white position-relative text-decoration-none">
                                <i className="bi bi-shuffle fs-4"></i>
                                {currentCompareCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info" style={{ fontSize: '0.65rem' }}>
                                        {currentCompareCount}
                                    </span>
                                )}
                            </Link>

                            <Link to="/cart" title={t('navbar.tooltips.cart')} className="text-white position-relative text-decoration-none">
                                <i className="bi bi-cart4 fs-4"></i>
                                {totalItems > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            <Link to="/wishlistpage" title={t('navbar.tooltips.wishlist')} className="text-white position-relative text-decoration-none me-2">
                                <i className="bi bi-heart-fill" style={{ fontSize: '1.4rem' }}></i>
                                {wishlist.length > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>

                            {isLoggedIn ? (
                                <div className="d-flex gap-2 ms-2">
                                    <Link to="/profile" className="btn btn-outline-light btn-sm">{t('navbar.profile')}</Link>
                                    <button onClick={handleLogout} className="btn btn-warning btn-sm">{t('navbar.logout')}</button>
                                </div>
                            ) : (
                                <Link className="btn btn-outline-light btn-sm ms-2" to="/login">{t('navbar.login')}</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                <div className="container">
                    <ul className="navbar-nav mx-auto gap-4">
                        {menuItems.map(item => (
                            <li key={item} className="nav-item">
                                <Link className="nav-link fw-semibold" to={`/${item}`}>
                                    {t(`navbar.menu.${item}`)}
                                </Link>
                            </li>
                        ))}
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold text-danger" to="/deals">
                                {t('navbar.menu.deals')}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold text-danger" to="/auctions">
                                <i className="bi bi-tag-fill me-1"></i>
                                {t('navbar.menu.auctions')}
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