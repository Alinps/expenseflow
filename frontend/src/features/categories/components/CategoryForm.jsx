import { useEffect, useState } from "react";

import styles from "../styles/Categories.module.css";

function CategoryForm({
  category,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(category?.name || "");
    setType(category?.type || "EXPENSE");
    setError("");
  }, [category]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Category name must contain 2–100 characters.");
      return;
    }

    try {
      const payload = category
        ? { name: trimmedName }
        : { name: trimmedName, type };

      await onSubmit(payload);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to save category."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <div className="category-field">
        <label htmlFor="categoryName">Category name</label>

        <input
          id="categoryName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Groceries"
          minLength={2}
          maxLength={100}
          required
        />
      </div>

      {!category && (
        <div className="category-field">
          <label htmlFor="categoryType">Category type</label>

          <select
            id="categoryType"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
      )}

      {error && (
        <p className="category-error">{error}</p>
      )}

      <div  className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : category
              ? "Update category"
              : "Add category"}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;