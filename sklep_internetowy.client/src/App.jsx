import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import Registration from './pages/Registration/Registration';
import UsersList from "./pages/Users/UsersList";

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
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/users" element={<UsersList users={users} />} />
            </Routes>
        </>
    );
}

export default App;
