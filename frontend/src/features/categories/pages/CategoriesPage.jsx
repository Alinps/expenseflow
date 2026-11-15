import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import categoryService from "../../../services/categoryService";

import CategoryTable from "../components/CategoryTable";
import CategoryModal from "../components/CategoryModal";
import DeleteCategoryDialog from "../components/DeleteCategoryDialog";
import { useToast } from "../../../hooks/useToast";

import styles from "../styles/Categories.module.css";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filterType, setFilterType] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await categoryService.getCategories(filterType);

      setCategories(
        Array.isArray(response)
          ? response
          : response.items || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openCreateModal() {
    setSelectedCategory(null);
    setModalOpen(true);
  }

  function openEditModal(category) {
    setSelectedCategory(category);
    setModalOpen(true);
  }

  async function handleSaveCategory(data) {
    setSubmitting(true);

    try {
      if (selectedCategory) {
        await categoryService.updateCategory(
          selectedCategory.id,
          data
        );
         showToast(
            "Category updated successfully!",
            "success"
        );
      } else {
        await categoryService.createCategory(data);
         showToast(
            "Category created successfully!",
            "success"
        );
      }

      setModalOpen(false);
      setSelectedCategory(null);

      await loadCategories();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");

    try {
      await categoryService.deleteCategory(deleteTarget.id);

      setDeleteTarget(null);
      showToast(
            "Category deleted successfully!",
            "success"
        );
      await loadCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to delete category. It may be associated with transactions."
      );
     showToast(error.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  const incomeCount = categories.filter(
    (category) => category.type === "INCOME"
  ).length;

  const expenseCount = categories.filter(
    (category) => category.type === "EXPENSE"
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Organize your income and expenses.</p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add category
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span>Total categories</span>
          <strong>{categories.length}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Income categories</span>
          <strong>{incomeCount}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Expense categories</span>
          <strong>{expenseCount}</strong>
        </div>
      </div>

      <div className={styles.filters}>
        <label htmlFor="categoryFilter">
          Filter categories:
        </label>

        <select
          id="categoryFilter"
          value={filterType}
          onChange={(event) => setFilterType(event.target.value)}
        >
          <option value="">All categories</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button type="button" onClick={loadCategories}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>
          Loading categories...
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
        />
      )}

      <CategoryModal
        isOpen={modalOpen}
        category={selectedCategory}
        onSubmit={handleSaveCategory}
        onClose={() => setModalOpen(false)}
        submitting={submitting}
      />

      <DeleteCategoryDialog
        category={deleteTarget}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}

export default CategoriesPage;