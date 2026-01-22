import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import Registration from './pages/Registration/Registration';
import Footer from './components/footer/Footer';
import ProductList from "./pages/Products/ProductList";
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import OrderManagement from './pages/AdminDashboard/Order/OrderManagement.jsx';
import Cart from './pages/Cart/Cart.jsx';
import ProductDetails from './pages/Products/ProductDetails'
import UsersManage from './pages/AdminDashboard/Users/UsersManage'
import CategoryProducts from './pages/Products/CategoryProducts.jsx';
import UserProfile from './pages/UserProfile/UserProfile';
import PromotionManagement from './pages/AdminDashboard/promotion/PromotionManagement.jsx';
import UserMessageManagement from './pages/AdminDashboard/messages/UserMessageManagement';
import ProductDetailsShop from "./pages/Products/Shop/ProductDetailsShop";
import ProtectedRoute from './components/ProtectedRoute';
import { useComparison } from './hooks/useComparison';
import ComparePage from './pages/Products/ComparePage';
import SearchPage from './pages/Products/Shop/SearchPage.jsx';
import AuctionList from "./pages/Auction/AuctionList";
import AuctionDetails from "./pages/Auction/AuctionDetails";
import CreateAuction from "./pages/Auction/CreateAuction";
import WishlistPage from './pages/WishList/WishlistPage';
import PaymentPage from './pages/Payment/PaymentPage';
import { ThemeProvider } from './context/ThemeContext';

/**
 * @file App.jsx
 * @brief Glowny komponent konfiguracyjny aplikacji TechStore.
 * @details Modul ten definiuje strukture routingu, zarzadza globalnymi dostawcami kontekstu (Theme) 
 * oraz integruje kluczowe elementy interfejsu takie jak pasek nawigacji i stopka.
 */

/**
 * @component App
 * @description Glowna funkcja aplikacji React. Odpowiada za renderowanie odpowiednich widokow 
 * na podstawie sciezki URL oraz przekazywanie stanu porownywarki do komponentow potomnych.
 */
function App() {
    /** @brief Inicjalizacja hooka zarzadzajacego stanem porownywarki produktow. */
    const comparison = useComparison();

    return (
        <ThemeProvider>
            {/* Pasek nawigacji z licznikiem przedmiotow w porownywarce */}
            <Navbar compareCount={comparison.compareItems.length} />

            <Routes>
                {/* --- SCIEZKI PUBLICZNE --- */}
                <Route path="/" element={<Home />}></Route>
                <Route path="/login" element={<LoginPage />}></Route>
                <Route path="/registration" element={<Registration />}></Route>
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlistpage" element={<WishlistPage />} />
                <Route path="/:slug" element={<CategoryProducts />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/compare" element={<ComparePage comparison={comparison} />} />

                {/* --- SZCZEGOLY PRODUKTU I PLATNOSCI --- */}
                <Route path="/product/:id" element={<ProductDetailsShop comparison={comparison} />} />
                <Route path="/payment" element={<PaymentPage />} />

                {/* --- MODUL AUKCJI --- */}
                <Route path="/auctions" element={<AuctionList />} />
                <Route path="/auction/:id" element={<AuctionDetails />} />

                {/* --- SCIEZKI ADMINISTRACYJNE (CHRONIONE) --- */}
                <Route path="/admin/create-auction" element={
                    <ProtectedRoute>
                        <CreateAuction />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/admin/orders" element={
                    <ProtectedRoute>
                        <OrderManagement />
                    </ProtectedRoute>
                } />

                <Route path="/admin/messages" element={
                    <ProtectedRoute>
                        <UserMessageManagement />
                    </ProtectedRoute>
                } />

                <Route path="/admin/products" element={
                    <ProtectedRoute>
                        <ProductList />
                    </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                    <ProtectedRoute>
                        <UsersManage />
                    </ProtectedRoute>
                } />

                <Route path="/admin/products/:id" element={
                    <ProtectedRoute>
                        <ProductDetails />
                    </ProtectedRoute>
                } />

                <Route path="/admin/promotions" element={
                    <ProtectedRoute>
                        <PromotionManagement />
                    </ProtectedRoute>
                } />

                {/* --- WYSZUKIWARKA --- */}
                <Route path="/search" element={
                    <ProtectedRoute>
                        <SearchPage />
                    </ProtectedRoute>
                } />
            </Routes>

            {/* Globalna stopka strony */}
            <Footer />
        </ThemeProvider>
    )
}

export default App;