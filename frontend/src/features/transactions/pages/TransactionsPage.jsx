import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import transactionService from "../../../services/transactionService";
import TransactionFilters from "../components/TransactionFilters";
import TransactionTable from "../components/TransactionTable";
import TransactionModal from "../components/TransactionModal";
import DeleteTransactionDialog from "../components/DeleteTransactionDialog";
import { useToast } from "../../../hooks/useToast";

import styles from "../styles/Transactions.module.css";

const PAGE_SIZE = 10;

const initialFilters = {
  search: "",
  type: "",
  category_id: "",
  start_date: "",
  end_date: "",
};

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState(initialFilters);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sortBy, setSortBy] = useState("transaction_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const loadCategories = useCallback(async () => {
    const response = await transactionService.getCategories();

    setCategories(
      Array.isArray(response) ? response : response.items || []
    );
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (filters.type) params.type = filters.type;

      if (filters.category_id) {
        params.category_id = filters.category_id;
      }

      if (filters.start_date) {
        params.start_date = filters.start_date;
      }

      if (filters.end_date) {
        params.end_date = filters.end_date;
      }

      const response =
        await transactionService.getTransactions(params);

      setTransactions(response.items || []);
      setTotal(response.total || 0);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, filters]);

  useEffect(() => {
    loadCategories().catch(() => {
      setError("Unable to load categories.");
    });
  }, [loadCategories]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    if (!search) return transactions;

    return transactions.filter((transaction) =>
      transaction.title?.toLowerCase().includes(search)
    );
  }, [transactions, filters.search]);

  function handleFilterChange(name, value) {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPage(1);
  }

  function handleResetFilters() {
    setFilters(initialFilters);
    setPage(1);
  }

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }

    setPage(1);
  }

  function openCreateModal() {
    setSelectedTransaction(null);
    setModalOpen(true);
  }

  function openEditModal(transaction) {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  }

  async function handleSaveTransaction(data) {
    setSubmitting(true);

    try {
      if (selectedTransaction) {
        await transactionService.updateTransaction(
          selectedTransaction.id,
          data
        );
      } else {
        await transactionService.createTransaction(data);
        showToast(
            "Transaction created successfully!",
            "success"
        );
      }

      setModalOpen(false);
      setSelectedTransaction(null);
      await loadTransactions();
    } catch (error) {
        showToast(
            error.response?.data?.detail ||
            "Failed to create transaction.",
            "error"
        );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTransaction() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await transactionService.deleteTransaction(
        deleteTarget.id
      );

      setDeleteTarget(null);

      showToast(
            "Transaction deleted successfully!",
            "success"
        );

      if (transactions.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadTransactions();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete transaction."
      );

      showToast(
            error.response?.data?.detail ||
            "Failed to create transaction.",
            "error"
        );
        
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Transactions</h1>
          <p>Manage your income and expenses.</p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add transaction
        </button>
      </div>

      <div className={styles.summary}>
        <span>Total transactions</span>
        <strong>{total}</strong>
      </div>

      <TransactionFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {error && (
        <div className={styles.error}>
          {error}
          <button type="button" onClick={loadTransactions}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.message}>
          Loading transactions...
        </div>
      ) : (
        <>
          <TransactionTable
            transactions={filteredTransactions}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          <div className={styles.pagination}>
            <span>
              Page {page} of {totalPages}
            </span>

            <div>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((previous) => previous - 1)
                }
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <TransactionModal
        isOpen={modalOpen}
        transaction={selectedTransaction}
        categories={categories}
        onSubmit={handleSaveTransaction}
        onClose={() => setModalOpen(false)}
        submitting={submitting}
      />

      <DeleteTransactionDialog
        transaction={deleteTarget}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}

export default TransactionsPage;