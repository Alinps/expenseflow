import styles from "../styles/Budgets.module.css";

function DeleteBudgetDialog({
  budget,
  onConfirm,
  onCancel,
  deleting,
}) {
  if (!budget) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.confirmDialog}>
        <h2>Delete budget?</h2>

        <p>
          Are you sure you want to delete the budget for{" "}
          <strong>
            {budget.category?.name || "this category"}
          </strong>
          ?
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
            {deleting ? "Deleting..." : "Delete budget"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBudgetDialog;