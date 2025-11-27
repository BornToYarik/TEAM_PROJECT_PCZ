import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import Registration from './pages/Registration/Registration';

import ProductList from "./pages/Products/ProductList";
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import OrderManagement from './pages/AdminDashboard/Order/OrderManagement.jsx';
import Cart from './pages/Cart/Cart.jsx';
import ProductDetails from './pages/Products/ProductDetails'
import UsersManage from './pages/AdminDashboard/Users/UsersManage'
import CategoryProducts from './pages/Products/CategoryProducts.jsx';
import UserProfile from './pages/UserProfile/UserProfile';


import UserMessageManagement from './pages/AdminDashboard/messages/UserMessageManagement';

function App() {

   


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

             
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />

              <Route path="/:slug" element={<CategoryProducts />} />

        </Routes>
    </>
  )
}

export default App;
