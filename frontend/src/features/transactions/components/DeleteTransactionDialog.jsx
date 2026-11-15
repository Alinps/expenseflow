function DeleteTransactionDialog({
  transaction,
  onConfirm,
  onCancel,
  deleting,
}) {
  if (!transaction) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 1100,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h3>Delete transaction?</h3>

        <p>
          Are you sure you want to delete{" "}
          <strong>{transaction.title}</strong>?
          This action cannot be undone.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button
            type="button"
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

export default DeleteTransactionDialog;