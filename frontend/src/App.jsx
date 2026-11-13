import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* Public routes */}
                    <Route element={<PublicRoute />}>
                        <Route
                            path="/login"
                            element={<LoginPage />}
                        />

                        <Route
                            path="/register"
                            element={<RegisterPage />}
                        />
                    </Route>

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/dashboard"
                            element={<DashboardPage />}
                        />
                    </Route>

                    {/* Default route */}
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    {/* Unknown route */}
                    <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;