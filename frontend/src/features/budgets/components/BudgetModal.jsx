import BudgetForm from "./BudgetForm";
import styles from "../styles/Budgets.module.css";

function BudgetModal({
  isOpen,
  budget,
  categories,
  month,
  year,
  onSubmit,
  onClose,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>
            {budget ? "Edit budget" : "Create budget"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <BudgetForm
          budget={budget}
          categories={categories}
          month={month}
          year={year}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default BudgetModal;