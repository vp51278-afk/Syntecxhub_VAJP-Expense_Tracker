import {
  Target,
  Plus,
  ArrowLeft,
  CalendarDays,
  TrendingUp,
  Wallet,
  X,
  Trash2,
  Save,
  CheckCircle2,
  Clock3,
  Sparkles,
  IndianRupee,
  Trophy,
  PiggyBank,
  ArrowUpRight,
  CircleDollarSign,
  LoaderCircle,
  AlertCircle,
  Flag,
  Rocket,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Goals.css";
import API_BASE_URL from "../api";

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getDateOnly = (date) => {
  if (!date) return null;

  const value = String(date).substring(0, 10);
  const parsed = new Date(`${value}T00:00:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDeadline = (date) => {
  const parsed = getDateOnly(date);

  if (!parsed) return "No deadline";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDaysRemaining = (date) => {
  const deadline = getDateOnly(date);

  if (!deadline) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
};

const getProgress = (saved, target) => {
  const targetAmount = Number(target || 0);

  if (targetAmount <= 0) return 0;

  return Math.min(
    Math.max(
      Math.round((Number(saved || 0) / targetAmount) * 100),
      0
    ),
    100
  );
};

const getGoalIcon = (icon) => {
  const icons = {
    target: Target,
    wallet: Wallet,
    trend: TrendingUp,
    travel: Rocket,
    savings: PiggyBank,
    trophy: Trophy,
  };

  return icons[icon] || Target;
};

const getDeadlineStatus = (goal) => {
  const percentage = getProgress(goal.saved, goal.target);
  const days = getDaysRemaining(goal.deadline);

  if (percentage >= 100) {
    return { label: "Goal completed", type: "completed" };
  }

  if (days === null) {
    return { label: "No deadline set", type: "neutral" };
  }

  if (days < 0) {
    return {
      label: `${Math.abs(days)} days overdue`,
      type: "overdue",
    };
  }

  if (days === 0) {
    return { label: "Due today", type: "urgent" };
  }

  if (days <= 7) {
    return { label: `${days} days left`, type: "urgent" };
  }

  return { label: `${days} days left`, type: "neutral" };
};

function Goals() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    saved: "0",
    deadline: "",
    icon: "target",
  });

  const [updateAmount, setUpdateAmount] = useState("");

  const getToken = () => localStorage.getItem("token");

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setNotice("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        setError(data.message || "Unable to load your financial goals.");
        return;
      }

      setGoals(Array.isArray(data.goals) ? data.goals : []);
    } catch (err) {
      console.error("Fetch Goals Error:", err);
      setError(
        "Unable to connect to the server. Please check your backend connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const totals = useMemo(() => {
    const saved = goals.reduce(
      (sum, goal) => sum + Number(goal.saved || 0),
      0
    );

    const target = goals.reduce(
      (sum, goal) => sum + Number(goal.target || 0),
      0
    );

    const completed = goals.filter(
      (goal) => getProgress(goal.saved, goal.target) >= 100
    ).length;

    const remaining = Math.max(target - saved, 0);

    return {
      count: goals.length,
      saved,
      target,
      remaining,
      completed,
      active: goals.length - completed,
      progress: target > 0 ? getProgress(saved, target) : 0,
    };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return goals.filter((goal) => {
      const matchesSearch = String(goal.title || "")
        .toLowerCase()
        .includes(query);

      const percentage = getProgress(goal.saved, goal.target);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && percentage < 100) ||
        (filter === "completed" && percentage >= 100);

      return matchesSearch && matchesFilter;
    });
  }, [goals, searchTerm, filter]);

  const resetAddForm = () => {
    setNewGoal({
      title: "",
      target: "",
      saved: "0",
      deadline: "",
      icon: "target",
    });
  };

  const closeAddModal = () => {
    if (saving) return;

    setShowAddModal(false);
    resetAddForm();
  };

  const closeUpdateModal = () => {
    if (saving) return;

    setShowUpdateModal(false);
    setSelectedGoal(null);
    setUpdateAmount("");
  };

  const handleAddGoal = async (event) => {
    event.preventDefault();

    const title = newGoal.title.trim();
    const target = Number(newGoal.target);
    const saved = Number(newGoal.saved || 0);

    if (!title) {
      setError("Please enter a name for your goal.");
      return;
    }

    if (!Number.isFinite(target) || target <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    if (!Number.isFinite(saved) || saved < 0 || saved > target) {
      setError("Your saved amount must be between ₹0 and your target.");
      return;
    }

    if (!newGoal.deadline) {
      setError("Please choose a deadline for your goal.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          target,
          saved,
          deadline: newGoal.deadline,
          icon: newGoal.icon,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        setError(data.message || "Unable to create your goal.");
        return;
      }

      if (data.goal) {
        setGoals((previous) => [...previous, data.goal]);
      } else {
        await fetchGoals();
      }

      setShowAddModal(false);
      resetAddForm();
      setNotice(`"${title}" was created successfully.`);
    } catch (err) {
      console.error("Create Goal Error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openUpdateModal = (goal) => {
    setSelectedGoal(goal);
    setUpdateAmount("");
    setError("");
    setNotice("");
    setShowUpdateModal(true);
  };

  const handleUpdateProgress = async (event) => {
    event.preventDefault();

    const amount = Number(updateAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    if (!selectedGoal) return;

    const currentSaved = Number(selectedGoal.saved || 0);
    const target = Number(selectedGoal.target || 0);

    if (currentSaved >= target) {
      setError("This goal has already reached its target.");
      return;
    }

    const newSaved = Math.min(currentSaved + amount, target);

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/goals/${selectedGoal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ saved: newSaved }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        setError(data.message || "Unable to update goal progress.");
        return;
      }

      if (data.goal) {
        setGoals((previous) =>
          previous.map((goal) =>
            goal._id === selectedGoal._id ? data.goal : goal
          )
        );
      } else {
        await fetchGoals();
      }

      setShowUpdateModal(false);
      setSelectedGoal(null);
      setUpdateAmount("");
      setNotice("Your savings progress has been updated.");
    } catch (err) {
      console.error("Update Goal Error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteGoal = async (goal) => {
    const confirmed = window.confirm(
      `Delete "${goal.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(goal._id);
      setError("");
      setNotice("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/goals/${goal._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        setError(data.message || "Unable to delete this goal.");
        return;
      }

      setGoals((previous) =>
        previous.filter((item) => item._id !== goal._id)
      );

      setNotice(`"${goal.title}" was deleted.`);
    } catch (err) {
      console.error("Delete Goal Error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setError("");
    setNotice("");
    setShowAddModal(true);
  };

  const renderGoalCard = (goal) => {
    const Icon = getGoalIcon(goal.icon);
    const saved = Number(goal.saved || 0);
    const target = Number(goal.target || 0);
    const percentage = getProgress(saved, target);
    const remaining = Math.max(target - saved, 0);
    const deadlineStatus = getDeadlineStatus(goal);
    const completed = percentage >= 100;

    return (
      <article className="goal-card" key={goal._id}>
        <div className="goal-card-top">
          <div className={`goal-icon goal-icon-${goal.icon || "target"}`}>
            <Icon size={23} />
          </div>

          <span className={`goal-status goal-status-${deadlineStatus.type}`}>
            {completed ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
            {deadlineStatus.label}
          </span>
        </div>

        <div className="goal-card-title-row">
          <h3>{goal.title}</h3>
          <span className="goal-percentage">{percentage}%</span>
        </div>

        <div className="goal-money">
          <strong>{formatMoney(saved)}</strong>
          <span>of {formatMoney(target)}</span>
        </div>

        <div
          className="goal-progress"
          role="progressbar"
          aria-label={`${goal.title} progress`}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={completed ? "goal-progress-fill completed" : "goal-progress-fill"}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="goal-progress-caption">
          <span>{completed ? "Target achieved!" : "Savings progress"}</span>
          <span>{formatMoney(remaining)} left</span>
        </div>

        <div className="goal-details">
          <div className="goal-detail-item">
            <span>Target amount</span>
            <strong>{formatMoney(target)}</strong>
          </div>

          <div className="goal-detail-item">
            <span>
              <CalendarDays size={13} />
              Deadline
            </span>
            <strong>{formatDeadline(goal.deadline)}</strong>
          </div>
        </div>

        <div className="goal-card-actions">
          <button
            type="button"
            className="goal-update-button"
            onClick={() => openUpdateModal(goal)}
            disabled={completed || deletingId === goal._id}
          >
            {completed ? <CheckCircle2 size={16} /> : <TrendingUp size={16} />}
            {completed ? "Goal Completed" : "Add Savings"}
          </button>

          <button
            type="button"
            className="goal-delete-button"
            onClick={() => deleteGoal(goal)}
            disabled={deletingId === goal._id}
            aria-label={`Delete ${goal.title}`}
            title="Delete goal"
          >
            {deletingId === goal._id ? (
              <LoaderCircle size={16} className="goal-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="goals-page">
        <div className="goals-loading">
          <div className="goals-loading-icon">
            <LoaderCircle size={30} className="goal-spin" />
          </div>
          <h2>Preparing your financial goals</h2>
          <p>Getting your savings journey ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="goals-page">
      <div className="goals-ambient goals-ambient-one" />
      <div className="goals-ambient goals-ambient-two" />

      <div className="goals-container">
        <div className="goals-topbar">
          <Link to="/dashboard" className="goals-back">
            <ArrowLeft size={17} />
            <span>Back to Dashboard</span>
          </Link>

          <div className="goals-topbar-label">
            <Sparkles size={14} />
            YOUR FINANCIAL JOURNEY
          </div>
        </div>

        <header className="goals-header">
          <div className="goals-heading-main">
            <div className="goals-title-icon">
              <Target size={30} />
              <span className="goals-title-icon-glow" />
            </div>

            <div className="goals-heading-copy">
              <span className="goals-eyebrow">PLAN. SAVE. ACHIEVE.</span>
              <h1>Financial Goals<span>.</span></h1>
              <p>Turn the things you dream about into milestones you can achieve.</p>
            </div>
          </div>

          <button
            type="button"
            className="add-goal-button"
            onClick={openAddModal}
          >
            <Plus size={19} />
            Add New Goal
          </button>
        </header>

        {error && (
          <div className="goals-message goals-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="goals-message goals-success" role="status">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="goals-summary" aria-label="Goals summary">
          <article className="goal-summary-card summary-total">
            <div className="goal-summary-top">
              <span className="goal-summary-icon"><Target size={19} /></span>
              <span className="goal-summary-label">TOTAL GOALS</span>
            </div>
            <strong>{totals.count}</strong>
            <div className="goal-summary-footer">
              <span>{totals.active} active</span>
              <span>{totals.completed} completed</span>
            </div>
          </article>

          <article className="goal-summary-card summary-saved">
            <div className="goal-summary-top">
              <span className="goal-summary-icon"><PiggyBank size={19} /></span>
              <span className="goal-summary-label">TOTAL SAVED</span>
            </div>
            <strong>{formatMoney(totals.saved)}</strong>
            <div className="goal-summary-footer">
              <TrendingUp size={14} />
              <span>Every rupee counts</span>
            </div>
          </article>

          <article className="goal-summary-card summary-target">
            <div className="goal-summary-top">
              <span className="goal-summary-icon"><Flag size={19} /></span>
              <span className="goal-summary-label">TOTAL TARGET</span>
            </div>
            <strong>{formatMoney(totals.target)}</strong>
            <div className="goal-summary-footer">
              <span>Across all your goals</span>
            </div>
          </article>

          <article className="goal-summary-card summary-progress">
            <div className="goal-summary-top">
              <span className="goal-summary-icon"><Trophy size={19} /></span>
              <span className="goal-summary-label">OVERALL PROGRESS</span>
            </div>
            <strong>{totals.progress}%</strong>
            <div
              className="overall-progress"
              role="progressbar"
              aria-label="Overall savings progress"
              aria-valuenow={totals.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div style={{ width: `${totals.progress}%` }} />
            </div>
            <div className="goal-summary-footer">
              <span>{formatMoney(totals.remaining)} to go</span>
            </div>
          </article>
        </section>

        <section className="goals-insight-strip">
          <div className="goals-insight-icon">
            <Sparkles size={22} />
          </div>

          <div className="goals-insight-copy">
            <span>YOUR SAVINGS SNAPSHOT</span>
            <h3>
              {totals.count === 0
                ? "Your next big milestone starts here."
                : totals.progress >= 100
                  ? "Amazing! Your combined target has been reached."
                  : "Small steps today. Bigger possibilities tomorrow."}
            </h3>
            <p>
              {totals.count === 0
                ? "Create your first goal and give your money a purpose."
                : `You've saved ${formatMoney(totals.saved)} towards ${formatMoney(totals.target)} across your financial goals.`}
            </p>
          </div>

          <div className="goals-insight-visual">
            <div className="goals-insight-orbit orbit-one" />
            <div className="goals-insight-orbit orbit-two" />
            <Trophy size={32} />
          </div>
        </section>

        <section className="goals-section">
          <div className="goals-section-heading">
            <div>
              <span className="goals-section-eyebrow">YOUR ROADMAP</span>
              <h2>Your Goals <span>{totals.count}</span></h2>
              <p>Keep track of your milestones and celebrate every bit of progress.</p>
            </div>

            <button
              type="button"
              className="goals-compact-add"
              onClick={openAddModal}
            >
              <Plus size={16} />
              Create Goal
            </button>
          </div>

          <div className="goals-toolbar">
            <div className="goals-filters" role="group" aria-label="Filter goals">
              {[
                { value: "all", label: "All Goals" },
                { value: "active", label: "In Progress" },
                { value: "completed", label: "Completed" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={filter === item.value ? "goals-filter active" : "goals-filter"}
                  onClick={() => setFilter(item.value)}
                  aria-pressed={filter === item.value}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <input
              type="search"
              className="goals-search"
              placeholder="Search your goals..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search goals"
            />
          </div>

          {filteredGoals.length > 0 ? (
            <div className="goals-grid">
              {filteredGoals.map(renderGoalCard)}

              <button
                type="button"
                className="new-goal-card"
                onClick={openAddModal}
              >
                <div className="new-goal-icon"><Plus size={26} /></div>
                <strong>Create a new goal</strong>
                <span>Start planning your next financial milestone.</span>
                <div className="new-goal-card-link">
                  Make it happen <ArrowUpRight size={15} />
                </div>
              </button>
            </div>
          ) : (
            <div className="goals-empty">
              <div className="goals-empty-art">
                {searchTerm || filter !== "all" ? (
                  <Target size={35} />
                ) : (
                  <CircleDollarSign size={38} />
                )}
              </div>

              <h3>
                {searchTerm
                  ? "No matching goals"
                  : filter === "completed"
                    ? "No completed goals yet"
                    : filter === "active"
                      ? "No goals in progress"
                      : "Your next achievement starts here"}
              </h3>

              <p>
                {searchTerm
                  ? "Try another search term to find your goal."
                  : filter !== "all"
                    ? "Try another filter or create a new financial goal."
                    : "Set a target, choose a deadline, and start building your future."}
              </p>

              {filter === "all" && !searchTerm && (
                <button
                  type="button"
                  className="add-goal-button"
                  onClick={openAddModal}
                >
                  <Plus size={18} />
                  Create Your First Goal
                </button>
              )}
            </div>
          )}
        </section>

        <section className="goal-tip">
          <div className="goal-tip-icon"><TrendingUp size={23} /></div>
          <div className="goal-tip-copy">
            <span>SMART SAVING TIP</span>
            <h3>Consistency beats perfection.</h3>
            <p>
              Break a big target into smaller milestones and add savings regularly.
              Your progress updates automatically as you contribute.
            </p>
          </div>
          <div className="goal-tip-badge">
            <IndianRupee size={17} />
            <span>One step at a time</span>
          </div>
        </section>
      </div>

      {showAddModal && (
        <div
          className="goal-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddModal();
          }}
        >
          <div
            className="goal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-goal-title"
          >
            <button
              type="button"
              className="goal-modal-close"
              onClick={closeAddModal}
              disabled={saving}
              aria-label="Close create goal form"
            >
              <X size={20} />
            </button>

            <div className="goal-modal-hero">
              <div className="goal-modal-hero-icon"><Target size={25} /></div>
              <span>FINANCIAL PLANNING</span>
            </div>

            <h2 id="create-goal-title">Create a new goal</h2>
            <p className="goal-modal-description">
              Give your next milestone a name, a target, and a deadline.
            </p>

            <form onSubmit={handleAddGoal}>
              <div className="goal-form-group">
                <label htmlFor="goal-title">Goal name</label>
                <input
                  id="goal-title"
                  type="text"
                  placeholder="e.g. New Laptop, Dream Vacation"
                  maxLength={100}
                  value={newGoal.title}
                  onChange={(event) =>
                    setNewGoal({ ...newGoal, title: event.target.value })
                  }
                  required
                />
              </div>

              <div className="goal-form-row">
                <div className="goal-form-group">
                  <label htmlFor="goal-target">Target amount (₹)</label>
                  <input
                    id="goal-target"
                    type="number"
                    placeholder="50000"
                    min="1"
                    step="0.01"
                    value={newGoal.target}
                    onChange={(event) =>
                      setNewGoal({ ...newGoal, target: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="goal-form-group">
                  <label htmlFor="goal-saved">Already saved (₹)</label>
                  <input
                    id="goal-saved"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={newGoal.saved}
                    onChange={(event) =>
                      setNewGoal({ ...newGoal, saved: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="goal-form-group">
                <label htmlFor="goal-deadline">Target deadline</label>
                <input
                  id="goal-deadline"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={newGoal.deadline}
                  onChange={(event) =>
                    setNewGoal({ ...newGoal, deadline: event.target.value })
                  }
                  required
                />
              </div>

              <div className="goal-form-group">
                <label>Choose a goal icon</label>
                <div className="goal-icon-picker">
                  {[
                    { value: "target", label: "Target", Icon: Target },
                    { value: "wallet", label: "Wallet", Icon: Wallet },
                    { value: "trend", label: "Growth", Icon: TrendingUp },
                    { value: "travel", label: "Travel", Icon: Rocket },
                    { value: "savings", label: "Savings", Icon: PiggyBank },
                    { value: "trophy", label: "Reward", Icon: Trophy },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        newGoal.icon === value
                          ? "goal-icon-choice selected"
                          : "goal-icon-choice"
                      }
                      onClick={() => setNewGoal({ ...newGoal, icon: value })}
                      aria-pressed={newGoal.icon === value}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="goal-form-preview">
                <div className="goal-form-preview-icon">
                  {(() => {
                    const PreviewIcon = getGoalIcon(newGoal.icon);
                    return <PreviewIcon size={21} />;
                  })()}
                </div>
                <div>
                  <span>YOUR GOAL PREVIEW</span>
                  <strong>{newGoal.title.trim() || "Your next big milestone"}</strong>
                  <small>
                    {formatMoney(newGoal.saved)} saved of {formatMoney(newGoal.target)}
                  </small>
                </div>
              </div>

              <button
                type="submit"
                className="goal-modal-submit"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle size={18} className="goal-spin" />
                ) : (
                  <Plus size={19} />
                )}
                {saving ? "Creating goal..." : "Create My Goal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && selectedGoal && (
        <div
          className="goal-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeUpdateModal();
          }}
        >
          <div
            className="goal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-goal-title"
          >
            <button
              type="button"
              className="goal-modal-close"
              onClick={closeUpdateModal}
              disabled={saving}
              aria-label="Close update progress form"
            >
              <X size={20} />
            </button>

            <div className="goal-modal-hero">
              <div className="goal-modal-hero-icon"><TrendingUp size={25} /></div>
              <span>KEEP MOVING FORWARD</span>
            </div>

            <h2 id="update-goal-title">Add to your savings</h2>
            <p className="goal-modal-description">
              Every contribution gets you closer to <strong>{selectedGoal.title}</strong>.
            </p>

            <div className="update-goal-info">
              <div>
                <span>Already saved</span>
                <strong>{formatMoney(selectedGoal.saved)}</strong>
              </div>
              <div>
                <span>Goal target</span>
                <strong>{formatMoney(selectedGoal.target)}</strong>
              </div>
              <div>
                <span>Still needed</span>
                <strong>
                  {formatMoney(
                    Math.max(
                      Number(selectedGoal.target || 0) -
                        Number(selectedGoal.saved || 0),
                      0
                    )
                  )}
                </strong>
              </div>
            </div>

            <div className="update-goal-progress">
              <div
                className="goal-progress"
                role="progressbar"
                aria-valuenow={getProgress(selectedGoal.saved, selectedGoal.target)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="goal-progress-fill"
                  style={{
                    width: `${getProgress(selectedGoal.saved, selectedGoal.target)}%`,
                  }}
                />
              </div>
              <span>
                {getProgress(selectedGoal.saved, selectedGoal.target)}% completed
              </span>
            </div>

            <form onSubmit={handleUpdateProgress}>
              <div className="goal-form-group">
                <label htmlFor="update-amount">Amount to add (₹)</label>
                <input
                  id="update-amount"
                  type="number"
                  placeholder="e.g. 2000"
                  min="0.01"
                  step="0.01"
                  max={Math.max(
                    Number(selectedGoal.target || 0) -
                      Number(selectedGoal.saved || 0),
                    0
                  )}
                  value={updateAmount}
                  onChange={(event) => setUpdateAmount(event.target.value)}
                  required
                />
              </div>

              <div className="goal-quick-amounts">
                {[500, 1000, 2000, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      const remaining = Math.max(
                        Number(selectedGoal.target || 0) -
                          Number(selectedGoal.saved || 0),
                        0
                      );

                      setUpdateAmount(String(Math.min(amount, remaining)));
                    }}
                  >
                    +{amount.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="goal-modal-submit"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle size={18} className="goal-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving progress..." : "Save My Progress"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
