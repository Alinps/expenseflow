import { AlertCircle, RefreshCw } from "lucide-react";
import styles from "./ErrorState.module.css";

function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the requested information.",
    onRetry,
}) {
    return (
        <div className={styles.container} role="alert">
            <div className={styles.iconWrapper}>
                <AlertCircle size={32} />
            </div>

            <h3>{title}</h3>

            <p>{message}</p>

            {onRetry && (
                <button
                    type="button"
                    className={styles.retryButton}
                    onClick={onRetry}
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            )}
        </div>
    );
}

export default ErrorState;