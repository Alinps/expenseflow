import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { formatCurrency, formatDate } from "../../../utils/formatters";

import styles from "../styles/DashboardSections.module.css";

function RecentTransactions({ transactions }) {
    const recentTransactions = [...transactions]
        .sort(
            (a, b) =>
                new Date(b.transaction_date) -
                new Date(a.transaction_date)
        )
        .slice(0, 5);

    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                <h3>Recent Transactions</h3>
            </div>

            {recentTransactions.length === 0 ? (
                <p className={styles.empty}>
                    No transactions found.
                </p>
            ) : (
                <div className={styles.transactionList}>
                    {recentTransactions.map((transaction) => {
                        const isIncome = transaction.type === "INCOME";

                        return (
                            <div
                                className={styles.transaction}
                                key={transaction.id}
                            >
                                <div className={styles.transactionIcon}>
                                    {isIncome ? (
                                        <ArrowDownRight
                                            color="#16A34A"
                                        />
                                    ) : (
                                        <ArrowUpRight
                                            color="#DC2626"
                                        />
                                    )}
                                </div>

                                <div className={styles.transactionInfo}>
                                    <strong>{transaction.title}</strong>

                                    <span>
                                        {transaction.category?.name || "Uncategorized"}
                                    </span>
                                </div>

                                <div className={styles.transactionAmount}>
                                    <strong
                                        className={
                                            isIncome
                                                ? styles.income
                                                : styles.expense
                                        }
                                    >
                                        {isIncome ? "+" : "-"}
                                        {formatCurrency(transaction.amount)}
                                    </strong>

                                    <span>
                                        {formatDate(transaction.transaction_date)}
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

export default RecentTransactions;