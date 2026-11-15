import styles from "../styles/Savings.module.css";

function DeleteGoalDialog({
  goal,
  onConfirm,
  onCancel,
  deleting,
}) {
  if (!goal) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.confirmDialog}>
        <h2>Delete savings goal?</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{goal.goal_name}</strong>?
        </p>

        <p className={styles.warning}>
          This operation may also affect the associated
          contribution history. Confirm your backend's
          deletion rules before proceeding.
        </p>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete goal"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteGoalDialog;