import Skeleton from "../Loading/Skeleton";
import styles from "../styles/Profile.module.css";

function ProfileCardSkeleton() {
    return (
        <div className={styles.profileCard}>
            {/* Avatar placeholder */}
            <Skeleton
                width="76px"
                height="76px"
                variant="circular"
            />

            {/* Profile details */}
            <div className={styles.profileDetails}>
                <Skeleton width="160px" height="22px" />
                <Skeleton width="200px" height="16px" />
            </div>
        </div>
    );
}

export default ProfileCardSkeleton;