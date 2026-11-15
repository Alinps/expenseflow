import Skeleton from "../Loading/Skeleton";
import styles from "./LoadingStates.module.css";

function DashboardSkeleton() {
    return (
        <div className={styles.dashboardSkeleton}>
            {/* Dashboard heading */}
            <div className={styles.dashboardHeader}>
                <div>
                    <Skeleton width="180px" height="28px" />
                    <Skeleton width="240px" height="16px" />
                </div>

                <Skeleton width="130px" height="38px" />
            </div>

            {/* Summary cards */}
            <div className={styles.summaryGrid}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div className={styles.summaryCard} key={index}>
                        <Skeleton width="50%" height="15px" />
                        <Skeleton width="70%" height="30px" />
                        <Skeleton width="40%" height="13px" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className={styles.chartGrid}>
                <div className={styles.chartCard}>
                    <Skeleton width="180px" height="20px" />
                    <Skeleton
                        width="100%"
                        height="260px"
                        variant="rectangular"
                    />
                </div>

                <div className={styles.chartCard}>
                    <Skeleton width="180px" height="20px" />
                    <Skeleton
                        width="100%"
                        height="260px"
                        variant="rectangular"
                    />
                </div>
            </div>

            {/* Recent transactions */}
            <div className={styles.recentSection}>
                <Skeleton width="190px" height="22px" />
                {Array.from({ length: 4 }).map((_, index) => (
                    <div className={styles.recentRow} key={index}>
                        <Skeleton width="40%" height="16px" />
                        <Skeleton width="20%" height="16px" />
                        <Skeleton width="20%" height="16px" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardSkeleton;