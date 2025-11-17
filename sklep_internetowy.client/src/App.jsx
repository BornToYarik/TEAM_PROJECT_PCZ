import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import Registration from './pages/Registration/Registration';
import UsersList from "./pages/Users/UsersList";
import ProductList from "./pages/Products/ProductList";
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import OrderManagement from './pages/AdminDashboard/Order/OrderManagement.jsx';
import Cart from './pages/Cart/Cart.jsx';
import ProductDetails from './pages/Products/ProductDetails'
import UsersManage from './pages/AdminDashboard/Users/UsersManage'
import CategoryProducts from './pages/Products/CategoryProducts.jsx';

//Admin dashboard
import UserMessageManagement from './pages/AdminDashboard/messages/UserMessageManagement';

function App() {

    const users = [
        {
            id: 1,
            name: "Jan Kowalski",
            email: "jan.kowalski@example.com",
            role: "admin",
            createdAt: "2024-09-15T10:30:00Z",
        },
        {
            id: 2,
            name: "Anna Nowak",
            email: "anna.nowak@example.com",
            role: "user",
            createdAt: "2024-10-01T12:00:00Z",
        },
    ];


  return (
      <>
        <Navbar />
        <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/login" element={<LoginPage />}></Route>
              <Route path="/registration" element={<Registration />}></Route>
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/messages" element={<UserMessageManagement />} />  
              <Route path="/admin/products" element={<ProductList />} />
              <Route path="/admin/users" element={<UsersManage/>} /> 
              <Route path="/admin/products/:id" element={<ProductDetails />} />

              <Route path="/users" element={<UsersList users={users} />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />

              <Route path="/laptops" element={<CategoryProducts />} />
              <Route path="/computers" element={<CategoryProducts />} />
              <Route path="/smartphones" element={<CategoryProducts />} />
              <Route path="/gaming" element={<CategoryProducts />} />
              <Route path="/accessories" element={<CategoryProducts />} />
              <Route path="/deals" element={<CategoryProducts />} />

        </Routes>
    </>
  )
}

export default App;
