import { useState } from "react";
import styles from "../styles/Savings.module.css";

function ContributionForm({
  goal,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState({
    amount: "",
    contribution_type: "CONTRIBUTION",
    description: "",
    contribution_date: new Date().toLocaleDateString("en-CA"),
  });

  const [error, setError] = useState("");

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

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (!form.contribution_date) {
      setError("Please select a date.");
      return;
    }

    try {
      await onSubmit({
        amount: Number(form.amount),
        contribution_type: form.contribution_type,
        description: form.description.trim(),
        contribution_date: form.contribution_date,
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to record transaction."
      );
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.goalBalance}>
        <span>Current savings</span>

        <strong>
          {formatCurrency(goal.current_amount)}
        </strong>
      </div>

      <div className={styles.field}>
        <label htmlFor="contribution_type">
          Transaction type
        </label>

        <select
          id="contribution_type"
          name="contribution_type"
          value={form.contribution_type}
          onChange={handleChange}
        >
          <option value="CONTRIBUTION">
            Add contribution
          </option>

          <option value="WITHDRAWAL">
            Withdraw money
          </option>
        </select>
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
          placeholder="Enter amount"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contribution_date">Date</label>

        <input
          id="contribution_date"
          name="contribution_date"
          type="date"
          value={form.contribution_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>

        <textarea
          id="description"
          name="description"
          rows="3"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional notes"
        />
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className={
            form.contribution_type === "WITHDRAWAL"
              ? styles.withdrawButton
              : ""
          }
        >
          {submitting
            ? "Processing..."
            : form.contribution_type === "WITHDRAWAL"
              ? "Withdraw money"
              : "Add contribution"}
        </button>
      </div>
    </form>
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default ContributionForm;