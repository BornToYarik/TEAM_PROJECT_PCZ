import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route } from 'react-router-dom';

// Komponenty stałe
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Strony publiczne
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import Registration from './pages/Registration/Registration';
import Cart from './pages/Cart/Cart.jsx';
import WishlistPage from './pages/WishList/WishlistPage';
import CategoryProducts from './pages/Products/CategoryProducts.jsx';
import UserProfile from './pages/UserProfile/UserProfile';
import ComparePage from './pages/Products/ComparePage';
import PaymentPage from './pages/Payment/PaymentPage.jsx';

// Strony produktów i wyszukiwania
import ProductList from "./pages/Products/ProductList";
import ProductDetails from './pages/Products/ProductDetails'
import ProductDetailsShop from "./pages/Products/Shop/ProductDetailsShop";
import SearchPage from './pages/Products/Shop/SearchPage.jsx';

// Moduł aukcji
import AuctionList from "./pages/Auction/AuctionList";
import AuctionDetails from "./pages/Auction/AuctionDetails";
import CreateAuction from "./pages/Auction/CreateAuction";
import MyAuctionWins from './pages/Auction/MyAuctionWins';

// Zarządzanie (Admin)
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import OrderManagement from './pages/AdminDashboard/Order/OrderManagement.jsx';
import UsersManage from './pages/AdminDashboard/Users/UsersManage'
import PromotionManagement from './pages/AdminDashboard/promotion/PromotionManagement.jsx';
import UserMessageManagement from './pages/AdminDashboard/messages/UserMessageManagement';

// Konteksty i Hooki
import { ThemeProvider } from './context/ThemeContext';
import { useComparison } from './hooks/useComparison';

/**
 * @file App.jsx
 * @brief Główny komponent konfiguracyjny aplikacji TechStore.
 * @details Moduł ten definiuje strukturę routingu, zarządza globalnymi dostawcami kontekstu (Theme) 
 * oraz integruje kluczowe elementy interfejsu takie jak pasek nawigacji i stopka.
 */

/**
 * @component App
 * @description Główna funkcja aplikacji React. Odpowiada za renderowanie odpowiednich widoków 
 * na podstawie ścieżki URL oraz przekazywanie stanu porównywarki do komponentów potomnych.
 */
function App() {
    /** @brief Inicjalizacja hooka zarządzającego stanem porównywarki produktów. */
    const comparison = useComparison();

    return (
        <ThemeProvider>
            {/* Pasek nawigacji z licznikiem przedmiotów w porównywarce */}
            <Navbar compareCount={comparison.compareItems.length} />

            <Routes>
                {/* --- ŚCIEŻKI PUBLICZNE --- */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlistpage" element={<WishlistPage />} />
                <Route path="/:slug" element={<CategoryProducts />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/compare" element={<ComparePage comparison={comparison} />} />

                {/* --- SZCZEGÓŁY PRODUKTU I PŁATNOŚCI --- */}
                <Route path="/product/:id" element={<ProductDetailsShop comparison={comparison} />} />
                <Route path="/payment" element={<PaymentPage />} />

                {/* --- MODUŁ AUKCJI --- */}
                <Route path="/auctions" element={<AuctionList />} />
                <Route path="/auction/:id" element={<AuctionDetails />} />
                <Route path="/my-auction-wins" element={<MyAuctionWins />} />

                {/* --- ŚCIEŻKI ADMINISTRACYJNE (CHRONIONE) --- */}
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
    );
}

export default App;