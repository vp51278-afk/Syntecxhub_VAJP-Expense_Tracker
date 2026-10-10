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
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./Goals.css";

function Goals() {
  const navigate = useNavigate();


  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showUpdateModal, setShowUpdateModal] =
    useState(false);

  const [selectedGoal, setSelectedGoal] =
    useState(null);

  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    saved: "",
    deadline: "",
  });

  const [updateAmount, setUpdateAmount] =
    useState("");


  const getToken = () => {
    return localStorage.getItem("token");
  };


  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };


  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/goals",
        {
          method: "GET",
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

        setError(
          data.message ||
            "Unable to fetch goals."
        );

        return;
      }

      setGoals(data.goals || []);
    } catch (error) {
      console.error(
        "Fetch Goals Error:",
        error
      );

      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchGoals();
  }, []);

  const totalSaved = useMemo(() => {
    return goals.reduce(
      (total, goal) =>
        total + Number(goal.saved || 0),
      0
    );
  }, [goals]);

  const totalTarget = useMemo(() => {
    return goals.reduce(
      (total, goal) =>
        total + Number(goal.target || 0),
      0
    );
  }, [goals]);

  const overallProgress =
    totalTarget > 0
      ? Math.min(
          Math.round(
            (totalSaved / totalTarget) *
              100
          ),
          100
        )
      : 0;


  const resetAddForm = () => {
    setNewGoal({
      title: "",
      target: "",
      saved: "",
      deadline: "",
    });
  };


  const handleAddGoal = async (e) => {
    e.preventDefault();

    const title = newGoal.title.trim();
    const target = Number(newGoal.target);
    const saved = Number(
      newGoal.saved || 0
    );

    if (!title) {
      alert("Please enter a goal name.");
      return;
    }

    if (!target || target <= 0) {
      alert(
        "Please enter a valid target amount."
      );
      return;
    }

    if (saved < 0 || saved > target) {
      alert(
        "Saved amount must be between ₹0 and target amount."
      );
      return;
    }

    if (!newGoal.deadline) {
      alert("Please select a deadline.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/goals",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            target,
            saved,
            deadline:
              newGoal.deadline,
            icon: "target",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        alert(
          data.message ||
            "Unable to create goal."
        );

        return;
      }

      setGoals((prev) => [
        ...prev,
        data.goal,
      ]);

      resetAddForm();
      setShowAddModal(false);
    } catch (error) {
      console.error(
        "Create Goal Error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setSaving(false);
    }
  };


  const openUpdateModal = (goal) => {
    setSelectedGoal(goal);
    setUpdateAmount("");
    setShowUpdateModal(true);
  };


  const handleUpdateProgress = async (e) => {
    e.preventDefault();

    const amount = Number(updateAmount);

    if (!amount || amount <= 0) {
      alert(
        "Please enter a valid amount."
      );
      return;
    }

    if (!selectedGoal) {
      return;
    }

    const currentSaved = Number(
      selectedGoal.saved || 0
    );

    const target = Number(
      selectedGoal.target || 0
    );

    const newSaved = Math.min(
      currentSaved + amount,
      target
    );

    if (newSaved === currentSaved) {
      alert(
        "This goal has already reached its target."
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/goals/${selectedGoal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            saved: newSaved,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        alert(
          data.message ||
            "Unable to update goal."
        );

        return;
      }

      setGoals((prev) =>
        prev.map((goal) =>
          goal._id === selectedGoal._id
            ? data.goal
            : goal
        )
      );

      setShowUpdateModal(false);
      setSelectedGoal(null);
      setUpdateAmount("");
    } catch (error) {
      console.error(
        "Update Goal Error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setSaving(false);
    }
  };


  const deleteGoal = async (goalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(goalId);

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/goals/${goalId}`,
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

        alert(
          data.message ||
            "Unable to delete goal."
        );

        return;
      }

      setGoals((prev) =>
        prev.filter(
          (goal) =>
            goal._id !== goalId
        )
      );
    } catch (error) {
      console.error(
        "Delete Goal Error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setDeletingId(null);
    }
  };


  const formatDeadline = (date) => {
    if (!date) {
      return "-";
    }

    const formatted = new Date(
      `${date.substring(0, 10)}T00:00:00`
    );

    if (Number.isNaN(formatted.getTime())) {
      return "-";
    }

    return formatted.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };


  const getGoalIcon = (icon) => {
    if (icon === "wallet") {
      return Wallet;
    }

    if (icon === "trend") {
      return TrendingUp;
    }

    return Target;
  };


  if (loading) {
    return (
      <div className="goals-page">
        <div className="goals-loading">
          Loading your goals...
        </div>
      </div>
    );
  }


  return (
    <div className="goals-page">


      <div className="goals-header">

        <div>

          <Link
            to="/dashboard"
            className="goals-back"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="goals-title-row">

            <div className="goals-title-icon">
              <Target size={27} />
            </div>

            <div>
              <h1>
                Financial Goals
              </h1>

              <p>
                Plan your goals and track
                your progress.
              </p>
            </div>

          </div>

        </div>

        <button
          className="add-goal-button"
          onClick={() =>
            setShowAddModal(true)
          }
        >
          <Plus size={18} />
          Add Goal
        </button>

      </div>


      {error && (
        <div className="goals-error">
          {error}
        </div>
      )}


      <section className="goals-summary">

        <div className="goal-summary-card">

          <span>
            Total Goals
          </span>

          <strong>
            {goals.length}
          </strong>

          <small>
            Active financial goals
          </small>

        </div>

        <div className="goal-summary-card">

          <span>
            Total Saved
          </span>

          <strong>
            ₹
            {totalSaved.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small className="goal-green">
            <TrendingUp size={13} />
            Keep going
          </small>

        </div>

        <div className="goal-summary-card">

          <span>
            Total Target
          </span>

          <strong>
            ₹
            {totalTarget.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Across all goals
          </small>

        </div>

        <div className="goal-summary-card highlight">

          <span>
            Overall Progress
          </span>

          <strong>
            {overallProgress}%
          </strong>

          <div className="overall-progress">

            <div
              style={{
                width: `${Math.min(
                  overallProgress,
                  100
                )}%`,
              }}
            ></div>

          </div>

        </div>

      </section>

      <section className="goals-section">

        <div className="goals-section-heading">

          <div>

            <h2>
              Your Goals
            </h2>

            <p>
              Track how close you are to
              achieving them.
            </p>

          </div>

          <span>
            {goals.length} Active
          </span>

        </div>

        <div className="goals-grid">

          {goals.map((goal) => {

            const Icon =
              getGoalIcon(
                goal.icon
              );

            const saved =
              Number(goal.saved || 0);

            const target =
              Number(goal.target || 0);

            const percentage =
              target > 0
                ? Math.min(
                    Math.round(
                      (saved /
                        target) *
                        100
                    ),
                    100
                  )
                : 0;

            const remaining =
              Math.max(
                target - saved,
                0
              );

            return (
              <div
                className="goal-card"
                key={goal._id}
              >

                <div className="goal-card-top">

                  <div className="goal-icon">
                    <Icon size={21} />
                  </div>

                  <div className="goal-percentage">
                    {percentage}%
                  </div>

                </div>

                <h3>
                  {goal.title}
                </h3>

                <div className="goal-money">

                  <strong>
                    ₹
                    {saved.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <span>
                    of ₹
                    {target.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="goal-progress">

                  <div
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>

                </div>

                <div className="goal-details">

                  <div>

                    <span>
                      Remaining
                    </span>

                    <strong>
                      ₹
                      {remaining.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Deadline
                    </span>

                    <strong>
                      <CalendarDays
                        size={13}
                      />

                      {formatDeadline(
                        goal.deadline
                      )}
                    </strong>

                  </div>

                </div>

                <button
                  className="goal-update-button"
                  onClick={() =>
                    openUpdateModal(
                      goal
                    )
                  }
                  disabled={
                    percentage >=
                    100
                  }
                >
                  <TrendingUp
                    size={15}
                  />

                  {percentage >= 100
                    ? "Goal Completed"
                    : "Update Progress"}
                </button>

                <button
                  onClick={() =>
                    deleteGoal(
                      goal._id
                    )
                  }
                  disabled={
                    deletingId ===
                    goal._id
                  }
                  className="goal-delete-button"
                >
                  <Trash2 size={13} />

                  {deletingId ===
                  goal._id
                    ? "Deleting..."
                    : "Delete Goal"}
                </button>

              </div>
            );
          })}

          <button
            className="new-goal-card"
            onClick={() =>
              setShowAddModal(true)
            }
          >

            <div className="new-goal-icon">
              <Plus size={25} />
            </div>

            <strong>
              Create a new goal
            </strong>

            <span>
              Start planning your next
              financial milestone.
            </span>

          </button>

        </div>

      </section>

      {goals.length === 0 && (
        <div className="goals-empty">

          <Target size={35} />

          <h3>
            No financial goals yet
          </h3>

          <p>
            Create your first goal and
            start tracking your progress.
          </p>

          <button
            className="add-goal-button"
            onClick={() =>
              setShowAddModal(true)
            }
          >
            <Plus size={18} />
            Create Goal
          </button>

        </div>
      )}


      <section className="goal-tip">

        <div className="goal-tip-icon">
          <TrendingUp size={22} />
        </div>

        <div>

          <span>
            SMART TIP
          </span>

          <h3>
            You're making good progress.
          </h3>

          <p>
            Keep your monthly savings
            consistent to reach your
            financial goals faster.
          </p>

        </div>

      </section>


      {showAddModal && (

        <div className="goal-modal-overlay">

          <div className="goal-modal">

            <button
              className="goal-modal-close"
              onClick={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
              disabled={saving}
            >
              <X size={20} />
            </button>

            <div className="goal-modal-label">
              FINANCIAL PLANNING
            </div>

            <h2>
              Create New Goal
            </h2>

            <p className="goal-modal-description">
              Set a target and start
              tracking your progress.
            </p>

            <form
              onSubmit={handleAddGoal}
            >

              <div className="goal-form-group">

                <label>
                  Goal Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. New Phone"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      title:
                        e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="goal-form-row">

                <div className="goal-form-group">

                  <label>
                    Target Amount
                  </label>

                  <input
                    type="number"
                    placeholder="50000"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        target:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="goal-form-group">

                  <label>
                    Already Saved
                  </label>

                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={newGoal.saved}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        saved:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="goal-form-group">

                <label>
                  Deadline
                </label>

                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      deadline:
                        e.target.value,
                    })
                  }
                  required
                />

              </div>

              <button
                type="submit"
                className="goal-modal-submit"
                disabled={saving}
              >

                <Plus size={18} />

                {saving
                  ? "Creating..."
                  : "Create Goal"}

              </button>

            </form>

          </div>

        </div>
      )}


      {showUpdateModal &&
        selectedGoal && (

          <div className="goal-modal-overlay">

            <div className="goal-modal">

              <button
                className="goal-modal-close"
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedGoal(null);
                  setUpdateAmount("");
                }}
                disabled={saving}
              >
                <X size={20} />
              </button>

              <div className="goal-modal-label">
                UPDATE GOAL
              </div>

              <h2>
                Add Progress
              </h2>

              <p className="goal-modal-description">

                Add money to your{" "}

                <strong>
                  {selectedGoal.title}
                </strong>{" "}

                goal.

              </p>

              <div className="update-goal-info">

                <div>

                  <span>
                    Current
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedGoal.saved ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Target
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedGoal.target ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

              <form
                onSubmit={
                  handleUpdateProgress
                }
              >

                <div className="goal-form-group">

                  <label>
                    Amount to Add
                  </label>

                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    min="1"
                    value={updateAmount}
                    onChange={(e) =>
                      setUpdateAmount(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="goal-modal-submit"
                  disabled={saving}
                >

                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : "Save Progress"}

                </button>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}

export default Goals;