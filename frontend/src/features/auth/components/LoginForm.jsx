import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "../schemas/authSchema";
import { useAuth } from "../../../context/AuthContext";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

import styles from "../styles/AuthForm.module.css";

function LoginForm({ onSuccess }) {
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            await login(data);

            onSuccess();

        } catch (error) {
            console.error("Login failed:", error);

            alert(
                error.response?.data?.detail ||
                "Unable to login. Please check your credentials."
            );
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
        >
            <div>
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    error={errors.email?.message}
                />
            </div>

            <div>
                <label className={styles.label}>
                    Password
                </label>

                <input
                    type="password"
                    placeholder="Enter your password"
                    className={styles.input}
                    {...register("password")}
                />

                {errors.password && (
                    <span className={styles.error}>
                        {errors.password.message}
                    </span>
                )}
            </div>

            <Button
                type="submit"
                size="large"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    );
}

export default LoginForm;