import { forwardRef } from "react";
import styles from "./Input.module.css";

const Input = forwardRef(function Input(
    {
        label,
        error,
        ...inputProps
    },
    ref
) {
    return (
        <div className={styles.inputGroup}>
            {label && (
                <label htmlFor={inputProps.name}>
                    {label}
                </label>
            )}

            <input
                {...inputProps}
                ref={ref}
                aria-invalid={Boolean(error)}
                aria-describedby={
                    error ? `${inputProps.name}-error` : undefined
                }
            />

            {error && (
                <span
                    id={`${inputProps.name}-error`}
                    className={styles.error}
                >
                    {error}
                </span>
            )}
        </div>
    );
});

export default Input;