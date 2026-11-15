import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import TransactionsPage from "./features/transactions/pages/TransactionsPage";


import ComingSoon from "./components/common/ComingSoon";

import AppLayout from "./components/layout/AppLayout";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";



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

                    {/* Protected application */}
                    <Route element={<ProtectedRoute />}>

                        <Route element={<AppLayout />}>

                            <Route
                                path="/dashboard"
                                element={<DashboardPage />}
                            />

                            <Route
                                path="/transactions"
                                element={<TransactionsPage />}
                            />

                            <Route
                                path="/categories"
                                element={
                                    <ComingSoon title="Categories" />
                                }
                            />

                            <Route
                                path="/budgets"
                                element={
                                    <ComingSoon title="Budgets" />
                                }
                            />

                            <Route
                                path="/savings"
                                element={
                                    <ComingSoon title="Savings Goals" />
                                }
                            />

                            <Route
                                path="/profile"
                                element={
                                    <ComingSoon title="My Profile" />
                                }
                            />
                           

                        </Route>

                    </Route>

                    {/* Default route */}
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    {/* Unknown routes */}
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