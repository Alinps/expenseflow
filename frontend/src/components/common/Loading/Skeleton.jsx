import styles from "./Skeleton.module.css";

function Skeleton({
    width = "100%",
    height = "16px",
    variant = "text",
    className = "",
}) {
    return (
        <div
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}

export default Skeleton;