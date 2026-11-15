import styles from "./Spinner.module.css";

function Spinner({ size = "medium", label = "Loading..." }) {
    return (
        <div
            className={styles.container}
            role="status"
            aria-label={label}
        >
            <div className={`${styles.spinner} ${styles[size]}`} />
            <span className={styles.label}>{label}</span>
        </div>
    );
}

export default Spinner;