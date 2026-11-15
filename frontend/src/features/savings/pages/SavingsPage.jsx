import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import savingsService from "../../../services/savingsService";

import SavingsGoalCard from "../components/SavingsGoalCard";
import SavingsGoalModal from "../components/SavingsGoalModal";
import ContributionModal from "../components/ContributionModal";
import ContributionHistory from "../components/ContributionHistory";
import DeleteGoalDialog from "../components/DeleteGoalDialog";
import { useToast } from "../../../hooks/useToast";

import styles from "../styles/Savings.module.css";

function SavingsPage() {
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [contributionGoal, setContributionGoal] = useState(null);
  const [historyGoal, setHistoryGoal] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await savingsService.getGoals();

      setGoals(
        Array.isArray(response)
          ? response
          : response.items || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load savings goals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  function openCreateModal() {
    setSelectedGoal(null);
    setGoalModalOpen(true);
  }

  function openEditModal(goal) {
    setSelectedGoal(goal);
    setGoalModalOpen(true);
  }

  async function handleSaveGoal(data) {
    setSubmitting(true);

    try {
      if (selectedGoal) {
        await savingsService.updateGoal(
          selectedGoal.id,
          data
        );
      } else {
        await savingsService.createGoal(data);
      }

      setGoalModalOpen(false);
      setSelectedGoal(null);

      await loadGoals();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleContribution(data) {
    if (!contributionGoal) return;

    setSubmitting(true);

    try {
      await savingsService.addContribution(
        contributionGoal.id,
        data
      );

      showToast(
            "Contribution added successfully!",
            "success"
        );

      setContributionGoal(null);
      await loadGoals();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function openHistory(goal) {
    setHistoryGoal(goal);
    setContributions([]);
    setHistoryLoading(true);

    try {
      const response =
        await savingsService.getContributions(goal.id);

      setContributions(
        Array.isArray(response)
          ? response
          : response.items || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load contribution history."
      );

      showToast(err.message, "error");

      setHistoryGoal(null);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleDeleteGoal() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");

    try {
      await savingsService.deleteGoal(deleteTarget.id);

      setDeleteTarget(null);
      showToast(
            "Savings deleteded successfully!",
            "success"
        );
      await loadGoals();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete savings goal."
      );
      showToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  const totalTarget = goals.reduce(
    (sum, goal) =>
      sum + Number(goal.target_amount || 0),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) =>
      sum + Number(goal.current_amount || 0),
    0
  );

  const completedGoals = goals.filter(
    (goal) => goal.is_completed
  ).length;

  const overallProgress =
    totalTarget > 0
      ? Math.min((totalSaved / totalTarget) * 100, 100)
      : 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Savings Goals</h1>
          <p>Set financial goals and track your progress.</p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Create goal
        </button>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Total savings targets</span>
          <strong>{formatCurrency(totalTarget)}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Total saved</span>
          <strong className={styles.savedAmount}>
            {formatCurrency(totalSaved)}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Completed goals</span>
          <strong>{completedGoals}</strong>
        </div>
      </div>

      <div className={styles.overallProgress}>
        <div className={styles.progressHeader}>
          <span>Overall savings progress</span>
          <strong>{overallProgress.toFixed(1)}%</strong>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressBar} ${styles.normalProgress}`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}

          <button type="button" onClick={loadGoals}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2>Your savings goals</h2>
        <span>{goals.length} goals</span>
      </div>

      {loading ? (
        <div className={styles.empty}>
          Loading savings goals...
        </div>
      ) : goals.length === 0 ? (
        <div className={styles.empty}>
          <h3>No savings goals yet</h3>
          <p>Create your first goal to start saving.</p>

          <button
            type="button"
            className={styles.addButton}
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Create your first goal
          </button>
        </div>
      ) : (
        <div className={styles.goalGrid}>
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
              onContribute={setContributionGoal}
              onHistory={openHistory}
            />
          ))}
        </div>
      )}

      <SavingsGoalModal
        isOpen={goalModalOpen}
        goal={selectedGoal}
        onSubmit={handleSaveGoal}
        onClose={() => setGoalModalOpen(false)}
        submitting={submitting}
      />

      <ContributionModal
        isOpen={Boolean(contributionGoal)}
        goal={contributionGoal}
        onSubmit={handleContribution}
        onClose={() => setContributionGoal(null)}
        submitting={submitting}
      />

      {historyGoal && (
        <ContributionHistory
          contributions={contributions}
          loading={historyLoading}
          onClose={() => setHistoryGoal(null)}
        />
      )}

      <DeleteGoalDialog
        goal={deleteTarget}
        onConfirm={handleDeleteGoal}
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

export default SavingsPage;