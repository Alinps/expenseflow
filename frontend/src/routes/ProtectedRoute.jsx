import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import AppLoader from "../components/common/AppLoader";

function ProtectedRoute() {
    const {
        isAuthenticated,
        loading,
    } = useAuth();

    if (loading) {
          return <AppLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;