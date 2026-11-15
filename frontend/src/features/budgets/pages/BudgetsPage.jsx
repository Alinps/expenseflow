import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import budgetService from "../../../services/budgetService";

import BudgetCard from "../components/BudgetCard";
import BudgetModal from "../components/BudgetModal";
import DeleteBudgetDialog from "../components/DeleteBudgetDialog";

import { useToast } from "../../../hooks/useToast";

import styles from "../styles/Budgets.module.css";

function BudgetsPage() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await budgetService.getBudgets(
        month,
        year
      );

      setBudgets(
        Array.isArray(response)
          ? response
          : response.items || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load budgets."
      );
      showToast(
            error.response?.data?.detail ||
            "Unable to load budgets.",
            "error"
        );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const loadCategories = useCallback(async () => {
    try {
      const response =
        await budgetService.getExpenseCategories();

      setCategories(
        Array.isArray(response)
          ? response
          : response.items || []
      );
    } catch {
      setError("Unable to load expense categories.");
      showToast(
            error.response?.data?.detail ||
            "Unable to load expense categories.",
            "error"
        );
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openCreateModal() {
    setSelectedBudget(null);
    setModalOpen(true);
  }

  function openEditModal(budget) {
    setSelectedBudget(budget);
    setModalOpen(true);
  }

  async function handleSaveBudget(data) {
    setSubmitting(true);

    try {
      if (selectedBudget) {
        await budgetService.updateBudget(
          selectedBudget.id,
          data
        );
        showToast(
            "Budget updated successfully!",
            "success"
        );
      } else {
        await budgetService.createBudget(data);
        showToast(
            "Budget created successfully!",
            "success"
        );
      }

      setModalOpen(false);
      setSelectedBudget(null);

      await loadBudgets();
    } catch (error) {
        showToast(
            error.response?.data?.detail ||
            "Failed to create or update Budget.",
            "error"
        );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBudget() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");

    try {
      await budgetService.deleteBudget(deleteTarget.id);

      setDeleteTarget(null);
      showToast(
            "Budget deleted successfully!",
            "success"
        );
      await loadBudgets();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete budget."
      );

       showToast(
            err.response?.data?.detail ||
            "Failed to delete Budget.",
            "error"
        );

    } finally {
      setDeleting(false);
    }
  }

  const totalBudget = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget.monthly_limit || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget.actual_spending || 0),
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const monthName = new Date(
    year,
    month - 1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const years = Array.from(
    { length: 5 },
    (_, index) => today.getFullYear() - 2 + index
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Budgets</h1>
          <p>Plan and monitor your monthly spending.</p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Create budget
        </button>
      </div>

      <div className={styles.periodSelector}>
        <div>
          <label htmlFor="budgetMonth">Month</label>

          <select
            id="budgetMonth"
            value={month}
            onChange={(event) =>
              setMonth(Number(event.target.value))
            }
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {new Date(2000, index).toLocaleDateString(
                  "en-IN",
                  { month: "long" }
                )}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="budgetYear">Year</label>

          <select
            id="budgetYear"
            value={year}
            onChange={(event) =>
              setYear(Number(event.target.value))
            }
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <span>{monthName}</span>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Total budget</span>
          <strong>
            {formatCurrency(totalBudget)}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Total spent</span>
          <strong className={styles.spentAmount}>
            {formatCurrency(totalSpent)}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Remaining</span>
          <strong
            className={
              totalRemaining < 0
                ? styles.negativeAmount
                : styles.remainingAmount
            }
          >
            {formatCurrency(totalRemaining)}
          </strong>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}

          <button type="button" onClick={loadBudgets}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2>Monthly budgets</h2>
        <span>{budgets.length} budgets</span>
      </div>

      {loading ? (
        <div className={styles.empty}>
          Loading budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div className={styles.empty}>
          <h3>No budgets for this month</h3>
          <p>Create a budget to start tracking your spending.</p>

          <button
            type="button"
            className={styles.addButton}
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Create your first budget
          </button>
        </div>
      ) : (
        <div className={styles.budgetGrid}>
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={modalOpen}
        budget={selectedBudget}
        categories={categories}
        month={month}
        year={year}
        onSubmit={handleSaveBudget}
        onClose={() => setModalOpen(false)}
        submitting={submitting}
      />

      <DeleteBudgetDialog
        budget={deleteTarget}
        onConfirm={handleDeleteBudget}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default BudgetsPage;