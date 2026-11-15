import SavingsGoalForm from "./SavingsGoalForm";
import styles from "../styles/Savings.module.css";

function SavingsGoalModal({
  isOpen,
  goal,
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
          <h2>{goal ? "Edit savings goal" : "Create savings goal"}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <SavingsGoalForm
          goal={goal}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default SavingsGoalModal;