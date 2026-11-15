import { Inbox } from "lucide-react";
import styles from "./EmptyState.module.css";

function EmptyState({
    icon: Icon = Inbox,
    title = "No data found",
    description = "There is nothing to display right now.",
    actionLabel,
    onAction,
}) {
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <Icon size={32} />
            </div>

            <h3>{title}</h3>

            <p>{description}</p>

            {actionLabel && onAction && (
                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default EmptyState;