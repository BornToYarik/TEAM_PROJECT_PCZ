import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import Home from './pages/Home/Home'
import LoginPage from './pages/LoginPage/LoginPage'
import Registration from './pages/Registration/Registration'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import OrderManagement from './pages/AdminDashboard/CRUDOrder/OrderManagement.jsx';

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
        </Routes>
    </>
  )
}

export default App
