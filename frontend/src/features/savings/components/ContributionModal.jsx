import ContributionForm from "./ContributionForm";
import styles from "../styles/Savings.module.css";

function ContributionModal({
  isOpen,
  goal,
  onSubmit,
  onClose,
  submitting,
}) {
  if (!isOpen || !goal) return null;

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
          <h2>Manage savings</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <p className={styles.modalSubtitle}>
          {goal.goal_name}
        </p>

        <ContributionForm
          goal={goal}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default ContributionModal;