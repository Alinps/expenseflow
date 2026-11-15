import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import dashboardService from "../../../services/dashboardService";

import DashboardHeader from "../components/DashboardHeader";
import SummaryCards from "../components/SummaryCards";
import FinancialChart from "../components/FinancialChart";
import ExpenseBreakdown from "../components/ExpenseBreakdown";
import RecentTransactions from "../components/RecentTransactions";
import BudgetOverview from "../components/BudgetOverview";
import SavingsOverview from "../components/SavingsOverview";

import DashboardSkeleton from "../../../components/common/LoadingStates/DashboardSkeleton";

import EmptyState from "../../../components/common/EmptyState/EmptyState";
import ErrorState from "../../../components/common/ErrorState/ErrorState";

import { Receipt } from "lucide-react";
import { Wallet } from "lucide-react";
import { PiggyBank } from "lucide-react";


import {
    formatCurrency,
    getCurrentMonthRange,
} from "../../../utils/formatters";

import styles from "../styles/Dashboard.module.css";

function getItems(response) {
    if (Array.isArray(response)) {
        return response;
    }

    return response?.items || [];
}

function calculateOverview(transactions, startDate, endDate) {
    const currentPeriodTransactions = transactions.filter(
        (transaction) =>
            transaction.transaction_date >= startDate &&
            transaction.transaction_date <= endDate
    );

    const totalIncome = currentPeriodTransactions
        .filter((transaction) => transaction.type === "INCOME")
        .reduce(
            (total, transaction) => total + Number(transaction.amount),
            0
        );

    const totalExpenses = currentPeriodTransactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .reduce(
            (total, transaction) => total + Number(transaction.amount),
            0
        );

    return {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_balance: totalIncome - totalExpenses,
        overall_balance: null,
    };
}

function DashboardPage() {
    const { user } = useAuth();

    const [overview, setOverview] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const today = new Date();

    const monthName = today.toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
    });

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            setLoading(true);
            setError("");

            const { startDate, endDate } = getCurrentMonthRange();

            const [overviewResult, transactionResult,
                budgetResult, savingsResult] = await Promise.allSettled([
                dashboardService.getOverview(startDate, endDate),
                dashboardService.getRecentTransactions(),
                dashboardService.getBudgets(
                    today.getMonth() + 1,
                    today.getFullYear()
                ),
                dashboardService.getSavingsGoals(),
            ]);

            if (!active) return;

            const transactionData =
                transactionResult.status === "fulfilled"
                    ? getItems(transactionResult.value)
                    : [];

            const budgetData =
                budgetResult.status === "fulfilled"
                    ? getItems(budgetResult.value)
                    : [];

            const savingsData =
                savingsResult.status === "fulfilled"
                    ? getItems(savingsResult.value)
                    : [];

            const overviewData =
                overviewResult.status === "fulfilled"
                    ? overviewResult.value
                    : calculateOverview(
                        transactionData,
                        startDate,
                        endDate
                    );

            setOverview(overviewData);
            setTransactions(transactionData);
            setBudgets(budgetData);
            setGoals(savingsData);

            const failedRequests = [
                overviewResult,
                transactionResult,
                budgetResult,
                savingsResult,
            ].filter((result) => result.status === "rejected");

            if (failedRequests.length > 0) {
                console.error(
                    "Some dashboard requests failed:",
                    failedRequests.map((result) => result.reason)
                );
            }

            if (
                transactionResult.status === "rejected" &&
                overviewResult.status === "rejected"
            ) {
                setError(
                    "Unable to load financial information. Please try again."
                );
            }

            setLoading(false);
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className={styles.stateMessage}>
                <p>{error}</p>

                <button onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className={styles.stateMessage}>
                Dashboard information is unavailable.
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <DashboardHeader
                user={user}
                monthName={monthName}
            />

            <SummaryCards overview={overview} />

            <div className={styles.chartGrid}>
                <FinancialChart
                    transactions={transactions}
                />

                <ExpenseBreakdown
                    transactions={transactions}
                />
            </div>

            <div className={styles.sectionGrid}>
            {transactions.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No recent transactions"
                        description="Your latest transactions will appear here."
                        actionLabel="Add Transaction"
                        onAction={() => navigate("/transactions")}
                    />
                ) : (
                    <RecentTransactions
                        transactions={transactions}
                    />
                )}

                {budgets.length === 0 ? (
                    <EmptyState
                        icon={Wallet}
                        title="No budgets created"
                        description="Create a budget to monitor your monthly expenses."
                        actionLabel="Create Budget"
                        onAction={() => navigate("/budgets")}
                    />
                ) : (
                    <BudgetOverview budgets={budgets} />
                )}

          {goals.length === 0 ? (
    <EmptyState
        icon={PiggyBank}
        title="No savings goals"
        description="Create a savings goal and track your progress."
        actionLabel="Create Goal"
        onAction={() => navigate("/savings")}
    />
) : (
    <SavingsOverview goals={goals} />
)}
            </div>

            <div className={styles.balanceFooter}>
                <span>Overall transaction balance</span>

                <strong>
                    {overview.overall_balance !== null
                        ? formatCurrency(overview.overall_balance)
                        : "Not available"}
                </strong>
            </div>
        </div>
    );
}




export default DashboardPage;