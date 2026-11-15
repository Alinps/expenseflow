import {
    TrendingUp,
    TrendingDown,
    Wallet,
} from "lucide-react";

import SummaryCard from "./SummaryCard";

import { formatCurrency } from "../../../utils/formatters";

import styles from "../styles/SummaryCards.module.css";

function SummaryCards({ overview }) {
    const cards = [
        {
            title: "Total Income",
            amount: overview.total_income,
            description: "Income during selected period",
            icon: TrendingUp,
            variant: "income",
        },
        {
            title: "Total Expenses",
            amount: overview.total_expenses,
            description: "Expenses during selected period",
            icon: TrendingDown,
            variant: "expense",
        },
        {
            title: "Net Balance",
            amount: overview.net_balance,
            description: "Income minus expenses",
            icon: Wallet,
            variant: "balance",
        },
    ];

    return (
        <div className={styles.grid}>
            {cards.map((card) => (
                <SummaryCard
                    key={card.title}
                    {...card}
                    amount={formatCurrency(card.amount)}
                />
            ))}
        </div>
    );
}

export default SummaryCards;