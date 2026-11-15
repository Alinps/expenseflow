import styles from "../styles/Savings.module.css";

function ContributionHistory({
  contributions,
  loading,
  onClose,
}) {
  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  }

  function formatDate(value) {
    if (!value) return "-";

    return new Date(
      `${value.slice(0, 10)}T00:00:00`
    ).toLocaleDateString("en-IN");
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.historyModal}>
        <div className={styles.modalHeader}>
          <h2>Contribution history</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className={styles.empty}>
            Loading history...
          </div>
        ) : contributions.length === 0 ? (
          <div className={styles.empty}>
            No contribution history found.
          </div>
        ) : (
          <div className={styles.historyList}>
            {contributions.map((item) => {
              const isContribution =
                item.contribution_type === "CONTRIBUTION";

              return (
                <div
                  key={item.id}
                  className={styles.historyItem}
                >
                  <div>
                    <strong>
                      {isContribution
                        ? "Contribution"
                        : "Withdrawal"}
                    </strong>

                    <p>
                      {item.description || "No description"}
                    </p>

                    <span>
                      {formatDate(item.contribution_date)}
                    </span>
                  </div>

                  <strong
                    className={
                      isContribution
                        ? styles.incomeAmount
                        : styles.expenseAmount
                    }
                  >
                    {isContribution ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContributionHistory;