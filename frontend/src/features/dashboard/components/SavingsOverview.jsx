import { formatCurrency } from "../../../utils/formatters";

import styles from "../styles/DashboardSections.module.css";

function SavingsOverview({ goals }) {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <h3>Savings Goals</h3>
            </div>

            {goals.length === 0 ? (
                <p className={styles.empty}>
                    No savings goals created yet.
                </p>
            ) : (
                <div className={styles.progressList}>
                    {goals.slice(0, 5).map((goal) => {
                        const percentage = Number(
                            goal.progress_percentage || 0
                        );

                        const progressWidth = Math.min(
                            percentage,
                            100
                        );

                        return (
                            <div
                                className={styles.progressItem}
                                key={goal.id}
                            >
                                <div className={styles.progressHeader}>
                                    <strong>{goal.goal_name}</strong>

                                    <span>
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>

                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.savingsBar}
                                        style={{
                                            width: `${progressWidth}%`,
                                        }}
                                    />
                                </div>

                                <div className={styles.progressFooter}>
                                    <span>
                                        Saved: {formatCurrency(goal.current_amount)}
                                    </span>

                                    <span>
                                        Target: {formatCurrency(goal.target_amount)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default SavingsOverview;