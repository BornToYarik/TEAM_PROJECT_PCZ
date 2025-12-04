import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/authUtils"; 

const ProtectedRoute = ({ children }) => {
    const isUserAdmin = isAdmin();

    if (!isUserAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;