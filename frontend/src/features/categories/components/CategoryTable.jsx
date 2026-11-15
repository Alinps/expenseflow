import { Pencil, Trash2 } from "lucide-react";
import styles from "../styles/Categories.module.css";

function CategoryTable({
  categories,
  onEdit,
  onDelete,
}) {
  if (!categories.length) {
    return (
      <div className={styles.empty}>
        No categories found.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Category name</th>
            <th>Type</th>
            <th>Created date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                <strong>{category.name}</strong>
              </td>

              <td>
                <span
                  className={
                    category.type === "INCOME"
                      ? styles.income
                      : styles.expense
                  }
                >
                  {category.type}
                </span>
              </td>

              <td>
                {new Date(
                  category.created_at
                ).toLocaleDateString("en-IN")}
              </td>

              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    title="Edit category"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    title="Delete category"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;