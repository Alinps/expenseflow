import { formatCurrency } from "../../../utils/formatters";

import styles from "../styles/DashboardSections.module.css";

function BudgetOverview({ budgets }) {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <h3>Budget Overview</h3>
            </div>

            {budgets.length === 0 ? (
                <p className={styles.empty}>
                    No budgets created for this month.
                </p>
            ) : (
                <div className={styles.progressList}>
                    {budgets.slice(0, 5).map((budget) => {
                        const percentage = Math.min(
                            Number(budget.utilization_percentage || 0),
                            100
                        );

                        const exceeded = budget.is_exceeded;

                        return (
                            <div
                                className={styles.progressItem}
                                key={budget.id}
                            >
                                <div className={styles.progressHeader}>
                                    <strong>
                                        {budget.category?.name || "Category"}
                                    </strong>

                                    <span>
                                        {Number(
                                            budget.utilization_percentage || 0
                                        ).toFixed(1)}%
                                    </span>
                                </div>

                                <div className={styles.progressTrack}>
                                    <div
                                        className={`${styles.progressBar} ${
                                            exceeded ? styles.exceeded : ""
                                        }`}
                                        style={{
                                            width: `${percentage}%`,
                                        }}
                                    />
                                </div>

                                <div className={styles.progressFooter}>
                                    <span>
                                        Spent: {formatCurrency(budget.actual_spending)}
                                    </span>

                                    <span>
                                        Limit: {formatCurrency(budget.monthly_limit)}
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

export default BudgetOverview;