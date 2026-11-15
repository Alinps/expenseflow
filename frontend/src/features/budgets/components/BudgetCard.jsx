import { Pencil, Trash2 } from "lucide-react";
import styles from "../styles/Budgets.module.css";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function BudgetCard({
  budget,
  onEdit,
  onDelete,
}) {
  const limit = Number(budget.monthly_limit || 0);
  const spent = Number(budget.actual_spending || 0);

  const utilization =
    budget.utilization_percentage != null
      ? Number(budget.utilization_percentage)
      : limit > 0
        ? (spent / limit) * 100
        : 0;

  const remaining =
    budget.remaining_budget != null
      ? Number(budget.remaining_budget)
      : limit - spent;

  const exceeded =
    budget.is_exceeded != null
      ? budget.is_exceeded
      : spent > limit;

  const progress = Math.min(
    Math.max(utilization, 0),
    100
  );

  const progressClass = exceeded
    ? styles.dangerProgress
    : utilization >= 80
      ? styles.warningProgress
      : styles.normalProgress;

  return (
    <article className={styles.budgetCard}>
      <div className={styles.cardHeader}>
        <div>
          <h3>
            {budget.category?.name || "Unnamed category"}
          </h3>

          <span className={styles.categoryLabel}>
            Monthly budget
          </span>
        </div>

        <div className={styles.cardActions}>
          <button
            type="button"
            title="Edit budget"
            onClick={() => onEdit(budget)}
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            title="Delete budget"
            onClick={() => onDelete(budget)}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className={styles.amountSection}>
        <div>
          <span>Spent</span>
          <strong>{formatCurrency(spent)}</strong>
        </div>

        <div>
          <span>Budget limit</span>
          <strong>{formatCurrency(limit)}</strong>
        </div>
      </div>

      <div className={styles.progressHeader}>
        <span>Budget utilization</span>

        <strong>
          {utilization.toFixed(1)}%
        </strong>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressBar} ${progressClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.remaining}>
        {exceeded ? (
          <span className={styles.exceeded}>
            Exceeded by {formatCurrency(Math.abs(remaining))}
          </span>
        ) : (
          <span>
            Remaining: {formatCurrency(remaining)}
          </span>
        )}
      </div>
    </article>
  );
}

export default BudgetCard;