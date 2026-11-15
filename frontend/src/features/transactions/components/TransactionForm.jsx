import { useEffect, useState } from "react";
import styles from "../styles/TransactionForm.module.css";

const initialForm = {
  title: "",
  amount: "",
  type: "EXPENSE",
  category_id: "",
  transaction_date: new Date().toLocaleDateString("en-CA"),
  description: "",
};

function TransactionForm({
  categories,
  transaction,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transaction) {
      setForm({
        title: transaction.title || "",
        amount: transaction.amount || "",
        type: transaction.type || "EXPENSE",
        category_id: transaction.category?.id
          ? String(transaction.category.id)
          : transaction.category_id
            ? String(transaction.category_id)
            : "",
        transaction_date:
          transaction.transaction_date?.slice(0, 10) ||
          initialForm.transaction_date,
        description: transaction.description || "",
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [transaction]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a transaction title.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    try {
      await onSubmit({
        title: form.title.trim(),
        amount: Number(form.amount),
        type: form.type,
        category_id: form.category_id,
        description: form.description,
        transaction_date: form.transaction_date,
        });
    } catch (err) {
        const detail = err.response?.data?.detail;

        if (Array.isArray(detail)) {
            setError(
            detail.map((item) => item.msg).join(", ")
            );
        } else if (typeof detail === "string") {
            setError(detail);
        } else {
            setError("Unable to save transaction.");
        }
        }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Grocery shopping"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="amount">Amount (₹)</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="type">Transaction type</label>
        <select
          id="type"
          name="type"
          value={form.type}
          onChange={handleChange}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="category_id">Category</label>
        <select
          id="category_id"
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          required
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="transaction_date">Date</label>
        <input
          id="transaction_date"
          name="transaction_date"
          type="date"
          value={form.transaction_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional notes"
          rows="3"
        />
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}
            <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    marginTop: "16px",
  }}
>
  <button
    type="button"
    onClick={onCancel}
    disabled={submitting}
    style={{
      padding: "11px 18px",
      border: "1px solid #E2E8F0",
      borderRadius: "7px",
      background: "#FFFFFF",
      color: "#0F172A",
      cursor: "pointer",
    }}
  >
    Cancel
  </button>

  <button
    type="submit"
    disabled={submitting}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "11px 18px",
      border: "1px solid #6366F1",
      borderRadius: "7px",
      background: "#6366F1",
      color: "#FFFFFF",
      fontWeight: "600",
      cursor: "pointer",
    }}
  >
    {submitting
      ? "Saving..."
      : transaction
        ? "Update transaction"
        : "Add transaction"}
  </button>
</div>
    </form>
  );
}

export default TransactionForm;