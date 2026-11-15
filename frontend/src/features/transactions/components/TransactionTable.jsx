import { Pencil, Trash2 } from "lucide-react";
import styles from "../styles/TransactionTable.module.css";

function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}) {
  if (!transactions.length) {
    return (
      <div className={styles.empty}>
        No transactions found.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>

            <th>
              <button
                type="button"
                onClick={() => onSort("amount")}
                className={styles.sortButton}
              >
                Amount
                {sortBy === "amount" &&
                  (sortOrder === "asc" ? " ↑" : " ↓")}
              </button>
            </th>

            <th>
              <button
                type="button"
                onClick={() => onSort("transaction_date")}
                className={styles.sortButton}
              >
                Date
                {sortBy === "transaction_date" &&
                  (sortOrder === "asc" ? " ↑" : " ↓")}
              </button>
            </th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <strong>{transaction.title}</strong>
              </td>

              <td>
                {transaction.category?.name || "Uncategorized"}
              </td>

              <td>
                <span
                  className={
                    transaction.type === "INCOME"
                      ? styles.income
                      : styles.expense
                  }
                >
                  {transaction.type}
                </span>
              </td>

              <td
                className={
                  transaction.type === "INCOME"
                    ? styles.incomeAmount
                    : styles.expenseAmount
                }
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {Number(transaction.amount).toLocaleString(
                  "en-IN",
                  {
                    style: "currency",
                    currency: "INR",
                  }
                )}
              </td>

              <td>
                {new Date(
                  `${transaction.transaction_date.slice(0, 10)}T00:00:00`
                ).toLocaleDateString("en-IN")}
              </td>

              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    title="Edit transaction"
                    onClick={() => onEdit(transaction)}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    title="Delete transaction"
                    onClick={() => onDelete(transaction)}
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

export default TransactionTable;