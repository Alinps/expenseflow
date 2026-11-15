import styles from "../styles/Categories.module.css";

function DeleteCategoryDialog({
  category,
  onConfirm,
  onCancel,
  deleting,
}) {
  if (!category) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.confirmDialog}>
        <h2>Delete category?</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{category.name}</strong>?
        </p>

        <p className={styles.warning}>
          Categories associated with transactions cannot
          be deleted.
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
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCategoryDialog;