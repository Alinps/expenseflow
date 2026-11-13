import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function PublicRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <p>Loading ExpenseFlow...</p>;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default PublicRoute;