import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import Home from './pages/Home/Home'
import LoginPage from './pages/LoginPage/LoginPage'

function App() {


  return (
      <>
        <Navbar />
        <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/login" element={<LoginPage />}></Route>
        </Routes>
    </>
  )
}

export default App
