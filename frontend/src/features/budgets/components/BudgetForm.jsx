import { useEffect, useState } from "react";
import styles from "../styles/Budgets.module.css";

function BudgetForm({
  budget,
  categories,
  month,
  year,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState({
    category_id: "",
    monthly_limit: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      category_id: budget?.category?.id
        ? String(budget.category.id)
        : budget?.category_id
          ? String(budget.category_id)
          : "",
      monthly_limit: budget?.monthly_limit || "",
    });

    setError("");
  }, [budget]);

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

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    if (
      !form.monthly_limit ||
      Number(form.monthly_limit) <= 0
    ) {
      setError("Budget limit must be greater than zero.");
      return;
    }

    try {
      await onSubmit({
        category_id: form.category_id,
        monthly_limit: Number(form.monthly_limit),
        month,
        year,
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to save budget."
      );
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.field}>
        <label htmlFor="category_id">
          Expense category
        </label>

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
        <label htmlFor="monthly_limit">
          Monthly budget limit (₹)
        </label>

        <input
          id="monthly_limit"
          name="monthly_limit"
          type="number"
          min="0.01"
          step="0.01"
          value={form.monthly_limit}
          onChange={handleChange}
          placeholder="e.g. 10000"
          required
        />
      </div>

      <div className={styles.periodInfo}>
        Budget period:{" "}
        <strong>
          {new Date(year, month - 1).toLocaleDateString(
            "en-IN",
            {
              month: "long",
              year: "numeric",
            }
          )}
        </strong>
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
            : budget
              ? "Update budget"
              : "Create budget"}
        </button>
      </div>
    </form>
  );
}

export default BudgetForm;