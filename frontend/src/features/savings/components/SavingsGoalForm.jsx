import { useEffect, useState } from "react";
import styles from "../styles/Savings.module.css";

function SavingsGoalForm({
  goal,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState({
    goal_name: "",
    target_amount: "",
    target_date: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      goal_name: goal?.goal_name || "",
      target_amount: goal?.target_amount || "",
      target_date: goal?.target_date?.slice(0, 10) || "",
    });

    setError("");
  }, [goal]);

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

    if (!form.goal_name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (
      !form.target_amount ||
      Number(form.target_amount) <= 0
    ) {
      setError("Target amount must be greater than zero.");
      return;
    }

    if (!form.target_date) {
      setError("Please select a target date.");
      return;
    }

    try {
      await onSubmit({
        goal_name: form.goal_name.trim(),
        target_amount: Number(form.target_amount),
        target_date: form.target_date,
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to save savings goal."
      );
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.field}>
        <label htmlFor="goal_name">Goal name</label>

        <input
          id="goal_name"
          name="goal_name"
          type="text"
          value={form.goal_name}
          onChange={handleChange}
          placeholder="e.g. Buy a new laptop"
          maxLength={100}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="target_amount">
          Target amount (₹)
        </label>

        <input
          id="target_amount"
          name="target_amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.target_amount}
          onChange={handleChange}
          placeholder="e.g. 50000"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="target_date">Target date</label>

        <input
          id="target_date"
          name="target_date"
          type="date"
          value={form.target_date}
          onChange={handleChange}
          required
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
        >
          {submitting
            ? "Saving..."
            : goal
              ? "Update goal"
              : "Create goal"}
        </button>
      </div>
    </form>
  );
}

export default SavingsGoalForm;