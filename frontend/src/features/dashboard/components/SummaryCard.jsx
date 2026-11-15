import styles from "../styles/SummaryCards.module.css";

function SummaryCard({
    title,
    amount,
    description,
    icon: Icon,
    variant,
}) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span>{title}</span>

                <div className={`${styles.icon} ${styles[variant]}`}>
                    <Icon size={20} />
                </div>
            </div>

            <h2>{amount}</h2>

            <p>{description}</p>
        </div>
    );
}

export default SummaryCard;