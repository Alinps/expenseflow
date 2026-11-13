import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .email("Enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(100, "Name is too long"),

    email: z
        .string()
        .email("Enter a valid email address"),

    password: z
        .string()
        .min(8, "Password must contain at least 8 characters"),

    confirmPassword: z
        .string()
        .min(1, "Please confirm your password"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);