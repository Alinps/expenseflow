import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import styles from "./Toast.module.css";

const toastConfig = {
    success: {
        icon: CheckCircle,
        title: "Success",
    },
    error: {
        icon: AlertCircle,
        title: "Error",
    },
    warning: {
        icon: AlertTriangle,
        title: "Warning",
    },
    info: {
        icon: Info,
        title: "Information",
    },
};

function Toast({ toast, onRemove }) {
    const config = toastConfig[toast.type] || toastConfig.info;
    const Icon = config.icon;

    return (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
            <Icon size={21} className={styles.icon} />

            <div className={styles.content}>
                <strong>{config.title}</strong>
                <p>{toast.message}</p>
            </div>

            <button
                type="button"
                className={styles.closeButton}
                onClick={() => onRemove(toast.id)}
                aria-label="Dismiss notification"
            >
                <X size={18} />
            </button>
        </div>
    );
}

export default Toast;