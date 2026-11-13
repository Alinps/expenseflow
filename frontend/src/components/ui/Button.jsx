import styles from "./Button.module.css";

function Button({
    children,
    variant = "primary",
    size = "medium",
    type = "button",
    disabled = false,
    onClick,
}) {
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[variant]} ${styles[size]}`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default Button;