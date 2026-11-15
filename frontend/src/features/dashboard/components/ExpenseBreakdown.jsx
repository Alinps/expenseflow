import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

import styles from "../styles/Charts.module.css";

import { formatCurrency } from "../../../utils/formatters";

const COLORS = [
    "#6366F1",
    "#16A34A",
    "#F59E0B",
    "#DC2626",
    "#0EA5E9",
    "#8B5CF6",
    "#EC4899",
    "#64748B",
];

function ExpenseBreakdown({ transactions }) {
    const categoryTotals = {};

    transactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .forEach((transaction) => {
            const categoryName =
                transaction.category?.name || "Uncategorized";

            categoryTotals[categoryName] =
                (categoryTotals[categoryName] || 0) +
                Number(transaction.amount);
        });

    const chartData = Object.entries(categoryTotals).map(
        ([name, value]) => ({
            name,
            value,
        })
    );

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
                <h3>Expense Breakdown</h3>
                <span>By category</span>
            </div>

            {chartData.length === 0 ? (
                <p className={styles.empty}>
                    No expense data available.
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                        />

                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default ExpenseBreakdown;