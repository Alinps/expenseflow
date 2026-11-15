import { createContext, useCallback, useState } from "react";

import Toast from "../components/common/Toast/Toast";
import styles from "../components/common/Toast/Toast.module.css";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((previous) =>
            previous.filter((toast) => toast.id !== id)
        );
    }, []);

    const showToast = useCallback((message, type = "info", duration = 3000) => {
        const id = crypto.randomUUID();

        setToasts((previous) => [
            ...previous,
            { id, message, type },
        ]);

        if (duration > 0) {
            window.setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}

            <div
                className={styles.toastContainer}
                aria-live="polite"
                aria-relevant="additions"
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}