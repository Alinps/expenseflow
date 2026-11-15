import Skeleton from "../Loading/Skeleton";
import styles from "./LoadingStates.module.css";

function CardGridSkeleton({ count = 3 }) {
    return (
        <div className={styles.cardGrid}>
            {Array.from({ length: count }).map((_, index) => (
                <div className={styles.cardSkeleton} key={index}>
                    <Skeleton width="45%" height="16px" />

                    <Skeleton
                        width="70%"
                        height="28px"
                    />

                    <Skeleton
                        width="100%"
                        height="10px"
                        variant="rectangular"
                    />

                    <div className={styles.cardFooter}>
                        <Skeleton width="35%" height="14px" />
                        <Skeleton width="25%" height="14px" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CardGridSkeleton;