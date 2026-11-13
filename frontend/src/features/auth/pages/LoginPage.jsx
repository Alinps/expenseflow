import { Link, useNavigate } from "react-router-dom";

import LoginForm from "../components/LoginForm";

import styles from "../styles/Auth.module.css";

function LoginPage() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/dashboard", { replace: true });
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.brand}>
                    <h1>ExpenseFlow</h1>
                    <p>Manage your money smarter.</p>
                </div>

                <div className={styles.heading}>
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your account.</p>
                </div>

                <LoginForm onSuccess={handleSuccess} />

                <p className={styles.footer}>
                    Don't have an account?
                    {" "}
                    <Link to="/register">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;