import styles from "./Card.module.css";

function Card({ title, children, className = "" }) {
    return (
        <section className={`${styles.card} ${className}`}>
            {title && (
                <h3 className={styles.title}>
                    {title}
                </h3>
            )}

            <div>
                {children}
            </div>
        </section>
    );
}

export default Card;