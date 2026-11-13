import { Link, useNavigate } from "react-router-dom";

import RegisterForm from "../components/RegisterForm";

import styles from "../styles/Auth.module.css";

function RegisterPage() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/login", { replace: true });
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.brand}>
                    <h1>ExpenseFlow</h1>
                    <p>Start managing your finances.</p>
                </div>

                <div className={styles.heading}>
                    <h2>Create Account</h2>
                    <p>Enter your details to get started.</p>
                </div>

                <RegisterForm onSuccess={handleSuccess} />

                <p className={styles.footer}>
                    Already have an account?
                    {" "}
                    <Link to="/login">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;