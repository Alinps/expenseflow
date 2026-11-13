import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema } from "../schemas/authSchema";
import { useAuth } from "../../../context/AuthContext";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

import styles from "../styles/AuthForm.module.css";

function RegisterForm({ onSuccess }) {
    const { register: registerUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            const { confirmPassword, ...userData } = data;

            await registerUser(userData);

            onSuccess();

        } catch (error) {
            console.error("Registration failed:", error);

            alert(
                error.response?.data?.detail ||
                "Unable to create your account."
            );
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
        >
            <Input
                label="Full Name"
                type="text"
                placeholder="Enter your name"
                {...register("name")}
                error={errors.name?.message}
            />

            <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                error={errors.email?.message}
            />

            <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                {...register("password")}
                error={errors.password?.message}
            />

            <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
            />

            <Button
                type="submit"
                size="large"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
        </form>
    );
}

export default RegisterForm;