import {
  Pencil,
  Trash2,
  PlusCircle,
  History,
} from "lucide-react";

import styles from "../styles/Savings.module.css";

function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
  onHistory,
}) {
  const target = Number(goal.target_amount || 0);
  const current = Number(goal.current_amount || 0);

  const percentage =
    goal.progress_percentage != null
      ? Number(goal.progress_percentage)
      : target > 0
        ? (current / target) * 100
        : 0;

  const remaining =
    goal.remaining_amount != null
      ? Number(goal.remaining_amount)
      : Math.max(target - current, 0);

  const completed =
    goal.is_completed != null
      ? goal.is_completed
      : current >= target;

  const progress = Math.min(
    Math.max(percentage, 0),
    100
  );

  return (
    <article className={styles.goalCard}>
      <div className={styles.goalHeader}>
        <div>
          <h3>{goal.goal_name}</h3>

          <span className={styles.goalDate}>
            Target date:{" "}
            {goal.target_date
              ? new Date(
                  `${goal.target_date.slice(0, 10)}T00:00:00`
                ).toLocaleDateString("en-IN")
              : "Not specified"}
          </span>
        </div>

        <div className={styles.cardActions}>
          <button
            type="button"
            title="Edit goal"
            onClick={() => onEdit(goal)}
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            title="Delete goal"
            onClick={() => onDelete(goal)}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className={styles.goalAmounts}>
        <div>
          <span>Saved</span>
          <strong>{formatCurrency(current)}</strong>
        </div>

        <div>
          <span>Target</span>
          <strong>{formatCurrency(target)}</strong>
        </div>
      </div>

      <div className={styles.progressHeader}>
        <span>Progress</span>
        <strong>{percentage.toFixed(1)}%</strong>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressBar} ${
            completed
              ? styles.completedProgress
              : styles.normalProgress
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.goalRemaining}>
        {completed ? (
          <span className={styles.completedLabel}>
            Goal completed!
          </span>
        ) : (
          <span>
            {formatCurrency(remaining)} remaining
          </span>
        )}
      </div>

      <div className={styles.goalActions}>
        <button
          type="button"
          onClick={() => onContribute(goal)}
        >
          <PlusCircle size={17} />
          Manage savings
        </button>

        <button
          type="button"
          onClick={() => onHistory(goal)}
        >
          <History size={17} />
          History
        </button>
      </div>
    </article>
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default SavingsGoalCard;