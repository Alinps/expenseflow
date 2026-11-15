import CategoryForm from "./CategoryForm";
import styles from "../styles/Categories.module.css";

function CategoryModal({
  isOpen,
  category,
  onSubmit,
  onClose,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>
            {category ? "Edit category" : "Add category"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <CategoryForm
          category={category}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default CategoryModal;