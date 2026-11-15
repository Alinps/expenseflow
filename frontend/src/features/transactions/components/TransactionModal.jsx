import TransactionForm from "./TransactionForm";
import styles from "../styles/TransactionForm.module.css";
import { useEffect } from "react";

function TransactionModal({
  isOpen,
  transaction,
  categories,
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
            {transaction
              ? "Edit transaction"
              : "Add transaction"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <TransactionForm
          categories={categories}
          transaction={transaction}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default TransactionModal;