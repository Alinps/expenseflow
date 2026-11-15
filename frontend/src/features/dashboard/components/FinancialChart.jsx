import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import styles from "../styles/Charts.module.css";

import { formatCurrency } from "../../../utils/formatters";

function FinancialChart({ transactions }) {
    const monthlyData = {};

    transactions.forEach((transaction) => {
        const date = new Date(transaction.transaction_date);

        const month = date.toLocaleString("en-IN", {
            month: "short",
            year: "numeric",
        });

        if (!monthlyData[month]) {
            monthlyData[month] = {
                month,
                income: 0,
                expenses: 0,
            };
        }

        if (transaction.type === "INCOME") {
            monthlyData[month].income += Number(transaction.amount);
        } else {
            monthlyData[month].expenses += Number(transaction.amount);
        }
    });

    const chartData = Object.values(monthlyData).reverse();

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
                <h3>Income vs Expenses</h3>
                <span>Based on loaded transactions</span>
            </div>

            {chartData.length === 0 ? (
                <p className={styles.empty}>
                    No transaction data available.
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis dataKey="month" />

                        <YAxis
                            tickFormatter={(value) => `₹${value}`}
                        />

                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                        />

                        <Legend />

                        <Bar
                            dataKey="income"
                            name="Income"
                            fill="#16A34A"
                            radius={[4, 4, 0, 0]}
                        />

                        <Bar
                            dataKey="expenses"
                            name="Expenses"
                            fill="#DC2626"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default FinancialChart;