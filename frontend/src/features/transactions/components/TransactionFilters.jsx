import styles from "../styles/Transactions.module.css";

function TransactionFilters({
  filters,
  categories,
  onFilterChange,
  onReset,
}) {
  return (
    <div className={styles.filters}>
      <input
        type="text"
        placeholder="Search transactions..."
        value={filters.search}
        onChange={(e) =>
          onFilterChange("search", e.target.value)
        }
      />

      <select
        value={filters.type}
        onChange={(e) =>
          onFilterChange("type", e.target.value)
        }
      >
        <option value="">All types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      <select
        value={filters.category_id}
        onChange={(e) =>
          onFilterChange("category_id", e.target.value)
        }
      >
        <option value="">All categories</option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.start_date}
        onChange={(e) =>
          onFilterChange("start_date", e.target.value)
        }
        aria-label="Start date"
      />

      <input
        type="date"
        value={filters.end_date}
        onChange={(e) =>
          onFilterChange("end_date", e.target.value)
        }
        aria-label="End date"
      />

      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

export default TransactionFilters;