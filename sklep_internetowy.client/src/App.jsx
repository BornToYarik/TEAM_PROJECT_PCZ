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
import { useComparison } from './Hooks/useComparison';
import ComparePage from './pages/Products/ComparePage';
import SearchPage from './pages/Products/Shop/SearchPage.jsx';

function App() {
    const comparison = useComparison();
    return (
        <>
            <Navbar compareCount={comparison.compareItems.length} />
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/login" element={<LoginPage />}></Route>
                <Route path="/registration" element={<Registration />}></Route>
                <Route path="/cart" element={<Cart />} />
                <Route path="/:slug" element={<CategoryProducts />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/compare" element={<ComparePage comparison={comparison} />} />

                <Route path="/product/:id" element={<ProductDetailsShop comparison={comparison} />} />

                <Route path="/auctions" element={<AuctionList />} />
                <Route path="/auction/:id" element={<AuctionDetails />} />
                <Route path="/admin/create-auction" element={<CreateAuction />} />

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

              <Route path="/search" element={
                    <ProtectedRoute>
                        <SearchPage />
                    </ProtectedRoute>
              } />
        </Routes>
        <Footer />
    </>
  )
}

export default App;