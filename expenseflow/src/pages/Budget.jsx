
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  CreditCard,
  BarChart3,
  Wallet,
  Target,
  ShoppingCart,
  User,
  CalendarDays,
  ChevronDown,
  Plus,
  Utensils,
  ShoppingBag,
  Car,
  FileText,
  Gamepad2,
  Heart,
  Leaf,
  MoreHorizontal,
  Bell,
  Lightbulb,
  ArrowRight,
  X,
  Pencil,
  Trash2,
  Save,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Budget.css";

const categories = [
  { name: "Food & Dining", icon: Utensils, color: "pink" },
  { name: "Shopping", icon: ShoppingBag, color: "orange" },
  { name: "Transport", icon: Car, color: "blue" },
  { name: "Bills & Utilities", icon: FileText, color: "purple" },
  { name: "Entertainment", icon: Gamepad2, color: "violet" },
  { name: "Health & Fitness", icon: Heart, color: "red" },
  { name: "Personal Care", icon: Leaf, color: "green" },
  { name: "Others", icon: MoreHorizontal, color: "gray" },
];

const defaultBudgets = [
  { id: 1, name: "Food & Dining", budget: 6000, spent: 0 },
  { id: 2, name: "Shopping", budget: 5000, spent: 0 },
  { id: 3, name: "Transport", budget: 3000, spent: 0 },
  { id: 4, name: "Bills & Utilities", budget: 5000, spent: 0 },
  { id: 5, name: "Entertainment", budget: 3000, spent: 0 },
  { id: 6, name: "Health & Fitness", budget: 2000, spent: 0 },
  { id: 7, name: "Personal Care", budget: 2000, spent: 0 },
  { id: 8, name: "Others", budget: 1000, spent: 0 },
];

const readJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getUser = () =>
  readJSON("user", null) ||
  readJSON("expenseflow-user", null) ||
  {};

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getTransactionDate = (transaction) => {
  const raw =
    transaction.date ||
    transaction.createdAt ||
    transaction.transactionDate;

  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getAmount = (transaction) =>
  Math.abs(Number(transaction.amount ?? transaction.value ?? 0));

const isExpense = (transaction) => {
  const type = String(transaction.type || "").toLowerCase();

  return (
    ["expense", "debit"].includes(type) ||
    transaction.isExpense === true
  );
};

const normalizeCategory = (value = "") =>
  String(value).toLowerCase().replace(/[^a-z]/g, "");

const categoryMatches = (transaction, categoryName) => {
  const transactionCategory = normalizeCategory(transaction.category);
  const category = normalizeCategory(categoryName);

  if (!transactionCategory) return category === "others";

  const aliases = {
    fooddining: ["food", "dining", "restaurant", "groceries"],
    shopping: ["shop", "clothing"],
    transport: ["travel", "fuel", "cab", "uber"],
    billsutilities: ["bill", "utility", "electricity", "rent"],
    entertainment: ["movie", "game"],
    healthfitness: ["health", "fitness", "medical", "hospital"],
    personalcare: ["personal", "salon"],
    others: ["other", "miscellaneous"],
  };

  return (
    transactionCategory === category ||
    (aliases[category] || []).some((alias) =>
      transactionCategory.includes(alias)
    )
  );
};

function Budget() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getUser);

  const [budgets, setBudgets] = useState(() =>
    readJSON("expenseflow-budgets", defaultBudgets)
  );

  const [transactions, setTransactions] = useState(() =>
    readJSON("transactions", [])
  );

  const [selectedMonth, setSelectedMonth] = useState(() =>
    getMonthKey(new Date())
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [budgetAlerts, setBudgetAlerts] = useState(
    () => localStorage.getItem("expenseflow-budget-alerts") !== "false"
  );

  const [formData, setFormData] = useState({
    name: "Food & Dining",
    budget: "",
    spent: "0",
  });

  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const currentUser = getUser();
    return Number(
      currentUser.monthlyIncome ||
      currentUser.income ||
      currentUser.monthlySalary ||
      0
    );
  });

  useEffect(() => {
    localStorage.setItem("expenseflow-budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(
      "expenseflow-budget-alerts",
      String(budgetAlerts)
    );
  }, [budgetAlerts]);

  useEffect(() => {
    const refreshData = () => {
      const currentUser = getUser();

      setUser(currentUser);
      setMonthlyIncome(
        Number(
          currentUser.monthlyIncome ||
          currentUser.income ||
          currentUser.monthlySalary ||
          0
        )
      );
      setTransactions(readJSON("transactions", []));
    };

    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const monthOptions = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1
      );

      return {
        value: getMonthKey(date),
        label: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };
    });
  }, []);

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  const monthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = getTransactionDate(transaction);
        return date && getMonthKey(date) === selectedMonth;
      }),
    [transactions, selectedMonth]
  );

  const expenseTransactions = useMemo(
    () => monthTransactions.filter(isExpense),
    [monthTransactions]
  );

  const getSpentForCategory = (name) => {
    if (expenseTransactions.length === 0) {
      return Number(
        budgets.find((item) => item.name === name)?.spent || 0
      );
    }

    return expenseTransactions
      .filter((transaction) => categoryMatches(transaction, name))
      .reduce((total, transaction) => total + getAmount(transaction), 0);
  };

  const displayBudgets = useMemo(
    () =>
      budgets.map((budget) => ({
        ...budget,
        spent:
          expenseTransactions.length > 0
            ? expenseTransactions
                .filter((transaction) =>
                  categoryMatches(transaction, budget.name)
                )
                .reduce(
                  (total, transaction) => total + getAmount(transaction),
                  0
                )
            : Number(budget.spent || 0),
      })),
    [budgets, expenseTransactions]
  );

  const totalBudgeted = displayBudgets.reduce(
    (total, item) => total + Number(item.budget || 0),
    0
  );

  const totalSpent = expenseTransactions.length
    ? expenseTransactions.reduce(
        (total, transaction) => total + getAmount(transaction),
        0
      )
    : displayBudgets.reduce(
        (total, item) => total + Number(item.spent || 0),
        0
      );

  const remaining = totalBudgeted - totalSpent;

  const incomeBudgetPercentage = monthlyIncome > 0
    ? Math.round((totalBudgeted / monthlyIncome) * 100)
    : 0;

  const remainingIncomePercentage = monthlyIncome > 0
    ? Math.round(
        (Math.max(monthlyIncome - totalSpent, 0) / monthlyIncome) * 100
      )
    : 0;

  const categorySpending = displayBudgets
    .filter((item) => item.spent > 0)
    .map((item) => {
      const category = categories.find(
        (entry) => entry.name === item.name
      );

      return {
        ...item,
        color: category?.color || "gray",
        amount: Number(item.spent),
      };
    });

  const categoryTotal = categorySpending.reduce(
    (total, item) => total + item.amount,
    0
  );

  const colors = {
    pink: "#ff3151",
    orange: "#ff9f43",
    blue: "#3b82f6",
    purple: "#a78bfa",
    violet: "#8b5cf6",
    red: "#ef4444",
    green: "#22c55e",
    gray: "#64748b",
  };

  let chartPosition = 0;

  const donutBackground = categoryTotal
    ? `conic-gradient(${categorySpending
        .map((item) => {
          const start = chartPosition;
          chartPosition += (item.amount / categoryTotal) * 100;

          return `${colors[item.color]} ${start}% ${chartPosition}%`;
        })
        .join(", ")})`
    : "conic-gradient(#1b252b 0% 100%)";

  const monthlyTrend = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() - 5 + index,
          1
        );

        const monthKey = getMonthKey(date);

        const spent = transactions
          .filter((transaction) => {
            const transactionDate = getTransactionDate(transaction);

            return (
              isExpense(transaction) &&
              transactionDate &&
              getMonthKey(transactionDate) === monthKey
            );
          })
          .reduce((sum, transaction) => sum + getAmount(transaction), 0);

        return {
          month: date.toLocaleDateString("en-US", {
            month: "short",
          }),
          spent,
        };
      }),
    [transactions, selectedDate]
  );

  const maxTrendValue = Math.max(
    ...monthlyTrend.map((item) => item.spent),
    1
  );

  const warningBudgets = displayBudgets.filter(
    (item) =>
      Number(item.budget) > 0 &&
      item.spent / item.budget >= 0.8
  );

  const notifications = [
    ...warningBudgets.map((item) => ({
      id: item.id,
      title: `${item.name} budget alert`,
      message: `${Math.round((item.spent / item.budget) * 100)}% of this budget has been used.`,
    })),
    ...(remaining < 0
      ? [{
          id: "overall",
          title: "Budget exceeded",
          message: `You are ₹${Math.abs(remaining).toLocaleString("en-IN")} over your total budget.`,
        }]
      : []),
  ];

  const insightMessage =
    totalSpent === 0
      ? "Add expenses to see spending insights for this month."
      : remaining < 0
        ? `You have exceeded your total budget by ₹${Math.abs(remaining).toLocaleString("en-IN")}. Review your category spending.`
        : `You have ₹${remaining.toLocaleString("en-IN")} left in your budgets. Keep tracking your expenses to stay on target.`;

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name:
        categories.find(
          (category) =>
            !budgets.some((budget) => budget.name === category.name)
        )?.name || "Food & Dining",
      budget: "",
      spent: "0",
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      budget: String(item.budget),
      spent: String(item.spent),
    });
    setMenuOpen(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveBudget = (event) => {
    event.preventDefault();

    const amount = Number(formData.budget);
    const spent = Number(formData.spent);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid budget amount.");
      return;
    }

    if (!Number.isFinite(spent) || spent < 0) {
      alert("Enter a valid spending amount.");
      return;
    }

    const duplicate = budgets.some(
      (item) =>
        item.name === formData.name &&
        item.id !== editingId
    );

    if (duplicate) {
      alert("This category already has a budget.");
      return;
    }

    if (editingId !== null) {
      setBudgets((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: formData.name,
                budget: amount,
                spent,
              }
            : item
        )
      );
    } else {
      setBudgets((previous) => [
        ...previous,
        {
          id: Date.now(),
          name: formData.name,
          budget: amount,
          spent,
        },
      ]);
    }

    closeModal();
  };

  const deleteBudget = (id) => {
    const item = budgets.find((budget) => budget.id === id);
    if (!item) return;

    if (!window.confirm(`Delete ${item.name} budget?`)) return;

    setBudgets((previous) =>
      previous.filter((budget) => budget.id !== id)
    );
    setMenuOpen(null);
  };

  const autoAllocateBudget = () => {
    if (monthlyIncome <= 0) {
      alert("Add your monthly income in your profile first.");
      navigate("/profile");
      return;
    }

    const available = monthlyIncome - totalBudgeted;

    if (available <= 0) {
      alert("No unallocated income is available.");
      return;
    }

    const existing = budgets.find((item) => item.name === "Others");

    if (existing) {
      setBudgets((previous) =>
        previous.map((item) =>
          item.id === existing.id
            ? { ...item, budget: Number(item.budget) + available }
            : item
        )
      );
    } else {
      setBudgets((previous) => [
        ...previous,
        {
          id: Date.now(),
          name: "Others",
          budget: available,
          spent: 0,
        },
      ]);
    }
  };

  const resetBudgets = () => {
    if (!window.confirm("Reset all budgets to default values?")) return;
    setBudgets(defaultBudgets);
  };

  const userName =
    user.name || user.username || user.fullName || "User";

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div className="budget-page">
      <aside className="budget-sidebar">
        <Link to="/dashboard" className="budget-logo">
          <div className="budget-logo-box">E</div>
          <span>Expense<span>Flow</span></span>
        </Link>

        <nav className="budget-navigation">
          <Link to="/dashboard" className="budget-nav-item">
            <Home size={20} /> <span>Dashboard</span>
          </Link>
          <Link to="/transactions" className="budget-nav-item">
            <CreditCard size={20} /> <span>Transactions</span>
          </Link>
          <Link to="/analytics" className="budget-nav-item">
            <BarChart3 size={20} /> <span>Analytics</span>
          </Link>
          <Link to="/budgets" className="budget-nav-item active">
            <Wallet size={20} /> <span>Budgets</span>
          </Link>
          <Link to="/goals" className="budget-nav-item">
            <Target size={20} /> <span>Goals</span>
          </Link>
          <Link to="/simulator" className="budget-nav-item">
            <ShoppingCart size={20} /> <span>Before You Buy</span>
          </Link>
          <Link to="/profile" className="budget-nav-item">
            <User size={20} /> <span>Profile</span>
          </Link>
        </nav>

        <div className="budget-smart-tip">
          <div className="budget-tip-icon">
            <Lightbulb size={25} />
          </div>
          <h3>Smart Tip</h3>
          <p>A clear budget today means a stress-free tomorrow!</p>
        </div>
      </aside>

      <main className="budget-main">
        <header className="budget-topbar">
          <div />
          <div className="budget-top-actions">
            <div className="budget-dropdown-wrapper">
              <CalendarDays size={17} />
              <select
                className="budget-month-select"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                aria-label="Select month"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>

            <div className="budget-notification-wrapper">
              <button
                type="button"
                className="budget-notification"
                onClick={() =>
                  setNotificationsOpen((previous) => !previous)
                }
                aria-label="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && <span />}
              </button>

              {notificationsOpen && (
                <div className="budget-notification-dropdown">
                  <strong>Budget Alerts</strong>
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="budget-alert-item"
                      >
                        <b>{notification.title}</b>
                        <p>{notification.message}</p>
                      </div>
                    ))
                  ) : (
                    <p>No budget alerts right now.</p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="budget-avatar"
              title={userName}
              onClick={() => navigate("/profile")}
            >
              {initials || "U"}
            </button>
          </div>
        </header>

        <section className="budget-heading">
          <div>
            <h1>Budgets</h1>
            <p>Plan your spending, stay in control, and achieve your goals.</p>
          </div>

          <button
            type="button"
            className="create-budget-button"
            onClick={openCreateModal}
          >
            <Plus size={19} /> Create Budget
          </button>
        </section>

        <section className="budget-summary">
          <SummaryCard
            icon={<Wallet size={25} />}
            color="blue"
            value={monthlyIncome}
            label="Monthly Income"
          />

          <SummaryCard
            icon={<BarChart3 size={25} />}
            color="pink"
            value={totalBudgeted}
            label="Total Budgeted"
            note={`${incomeBudgetPercentage}% of income`}
          />

          <SummaryCard
            icon={<Wallet size={25} />}
            color="orange"
            value={remaining}
            label="Budget Remaining"
            note={remaining < 0 ? "Over budget" : `${remainingIncomePercentage}% of income left`}
            negative={remaining < 0}
          />

          <SummaryCard
            icon={<CreditCard size={25} />}
            color="purple"
            value={totalSpent}
            label="Total Spent"
            note={`${displayBudgets.length} categories`}
          />
        </section>

        <section className="budget-content-grid">
          <div className="budget-panel budget-category-panel">
            <div className="budget-panel-heading">
              <div>
                <h2>Spending by Category</h2>
                <p>
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <BarChart3 size={19} />
            </div>

            <div className="budget-donut-layout">
              <div
                className="budget-donut-chart"
                style={{ background: donutBackground }}
              >
                <div className="budget-donut-hole">
                  <span>Total Spent</span>
                  <strong>
                    ₹{totalSpent.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="budget-legend">
                {categorySpending.length ? (
                  categorySpending.map((item) => (
                    <Legend
                      key={item.id}
                      color={item.color}
                      name={item.name}
                      value={`₹${item.amount.toLocaleString("en-IN")} · ${
                        categoryTotal
                          ? Math.round((item.amount / categoryTotal) * 100)
                          : 0
                      }%`}
                    />
                  ))
                ) : (
                  <p className="budget-empty-state">
                    No expenses recorded for this month.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="budget-panel budget-trend-panel">
            <div className="budget-panel-heading">
              <div>
                <h2>Monthly Spending Trend</h2>
                <p>Last six months</p>
              </div>
              <BarChart3 size={19} />
            </div>

            <div className="budget-trend-chart">
              {monthlyTrend.map((item, index) => (
                <TrendBar
                  key={`${item.month}-${index}`}
                  month={item.month}
                  amount={item.spent}
                  height={`${
                    item.spent
                      ? Math.max((item.spent / maxTrendValue) * 100, 5)
                      : 0
                  }%`}
                  active={index === monthlyTrend.length - 1}
                />
              ))}
            </div>

            <div className="budget-trend-footer">
              <span>Selected month</span>
              <strong>
                ₹{(monthlyTrend[5]?.spent || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </section>

        <section className="budget-panel budget-allocation-panel">
          <div className="budget-panel-heading">
            <div>
              <h2>Budget Allocation</h2>
              <p>Manage your spending limits by category.</p>
            </div>

            <button
              type="button"
              className="budget-text-button"
              onClick={autoAllocateBudget}
            >
              <Sparkles size={16} /> Auto Allocate
            </button>
          </div>

          <div className="budget-allocation-list">
            {displayBudgets.map((item) => {
              const category = categories.find(
                (entry) => entry.name === item.name
              );
              const Icon = category?.icon || MoreHorizontal;

              const percentage =
                item.budget > 0
                  ? Math.round((item.spent / item.budget) * 100)
                  : 0;

              return (
                <div className="budget-allocation-item" key={item.id}>
                  <div className={`budget-category-icon ${category?.color || "gray"}`}>
                    <Icon size={20} />
                  </div>

                  <div className="budget-allocation-details">
                    <div className="budget-allocation-title">
                      <strong>{item.name}</strong>

                      <div className="budget-item-actions">
                        <button
                          type="button"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          aria-label={`More options for ${item.name}`}
                          onClick={() =>
                            setMenuOpen(
                              menuOpen === item.id ? null : item.id
                            )
                          }
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {menuOpen === item.id && (
                          <div className="budget-item-menu">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                            >
                              <Pencil size={15} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBudget(item.id)}
                            >
                              <Trash2 size={15} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="budget-progress-track">
                      <div
                        className={`budget-progress-fill ${category?.color || "gray"} ${
                          percentage >= 100 ? "over-limit" : ""
                        }`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="budget-allocation-meta">
                      <span>
                        ₹{item.spent.toLocaleString("en-IN")} spent
                      </span>
                      <span>
                        ₹{Number(item.budget).toLocaleString("en-IN")} budget
                      </span>
                    </div>
                  </div>

                  <div
                    className={`budget-usage-percentage ${
                      percentage >= 100 ? "budget-red-text" : ""
                    }`}
                  >
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="budget-allocation-footer">
            <span>Total allocation</span>
            <strong>
              ₹{totalBudgeted.toLocaleString("en-IN")}
            </strong>
          </div>
        </section>

        <section className="budget-bottom-grid">
          <div className="budget-panel budget-insight-panel">
            <div className="budget-insight-icon">
              <Lightbulb size={23} />
            </div>

            <div className="budget-insight-content">
              <h2>Smart Budget Insight</h2>
              <p>{insightMessage}</p>

              {monthlyIncome <= 0 && (
                <button
                  type="button"
                  className="budget-text-button"
                  onClick={() => navigate("/profile")}
                >
                  Set monthly income <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="budget-panel budget-alert-settings">
            <div className="budget-panel-heading">
              <div>
                <h2>Budget Alerts</h2>
                <p>Get notified when categories approach their limits.</p>
              </div>
              <Bell size={20} />
            </div>

            <label className="budget-toggle-row">
              <span>
                <strong>Spending alerts</strong>
                <small>Show alerts when a budget reaches 80%.</small>
              </span>

              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(event) =>
                  setBudgetAlerts(event.target.checked)
                }
              />
            </label>

            {budgetAlerts && warningBudgets.length > 0 && (
              <p className="budget-alert-warning">
                <AlertCircle size={16} />
                {warningBudgets.length} categories need attention.
              </p>
            )}
          </div>
        </section>

        <section className="budget-panel budget-actions-panel">
          <div className="budget-panel-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your finances in a few clicks.</p>
            </div>
          </div>

          <div className="budget-quick-actions">
            <QuickAction
              icon={<Plus size={19} />}
              text="Create a budget"
              onClick={openCreateModal}
            />
            <QuickAction
              icon={<CreditCard size={19} />}
              text="View transactions"
              onClick={() => navigate("/transactions")}
            />
            <QuickAction
              icon={<BarChart3 size={19} />}
              text="View analytics"
              onClick={() => navigate("/analytics")}
            />
          </div>

          <div className="budget-reset-row">
            <span>Want to start fresh?</span>
            <button type="button" onClick={resetBudgets}>
              Reset budgets
            </button>
          </div>
        </section>

        {modalOpen && (
          <div
            className="budget-modal-overlay"
            onClick={closeModal}
            role="presentation"
          >
            <div
              className="budget-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="budget-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="budget-modal-header">
                <div>
                  <span>{editingId !== null ? "UPDATE BUDGET" : "NEW BUDGET"}</span>
                  <h2 id="budget-modal-title">
                    {editingId !== null ? "Edit Budget" : "Create Budget"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="budget-modal-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveBudget}>
                <div className="budget-form-group">
                  <label htmlFor="budget-category">Category</label>
                  <select
                    id="budget-category"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    disabled={editingId !== null}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="budget-form-group">
                  <label htmlFor="budget-amount">Budget Amount</label>
                  <div className="budget-input-with-symbol">
                    <span>₹</span>
                    <input
                      id="budget-amount"
                      type="number"
                      name="budget"
                      min="1"
                      step="0.01"
                      value={formData.budget}
                      onChange={handleFormChange}
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>

                <div className="budget-form-group">
                  <label htmlFor="budget-spent">Already Spent</label>
                  <div className="budget-input-with-symbol">
                    <span>₹</span>
                    <input
                      id="budget-spent"
                      type="number"
                      name="spent"
                      min="0"
                      step="0.01"
                      value={formData.spent}
                      onChange={handleFormChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="budget-form-actions">
                  <button
                    type="button"
                    className="budget-cancel-button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="budget-save-button"
                  >
                    <Save size={17} />
                    {editingId !== null ? "Save Changes" : "Create Budget"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  icon,
  color,
  value,
  label,
  note,
  negative = false,
}) {
  return (
    <div className="budget-summary-card">
      <div className={`budget-summary-icon ${color}`}>
        {icon}
      </div>
      <div>
        <strong>₹{Number(value || 0).toLocaleString("en-IN")}</strong>
        <span>{label}</span>
        {note && (
          <small className={negative ? "budget-red-text" : "budget-green-text"}>
            {note}
          </small>
        )}
      </div>
    </div>
  );
}

function Legend({ color, name, value }) {
  return (
    <div className="budget-legend-item">
      <span
        className="legend-dot"
        style={{ backgroundColor: colors[color] || colors.gray }}
      />
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TrendBar({ month, amount = 0, height, active = false }) {
  return (
    <div className="trend-bar-item">
      <div className="trend-bar-wrapper">
        <div
          className={active ? "trend-bar active" : "trend-bar"}
          style={{ height }}
          title={`${month}: ₹${Number(amount).toLocaleString("en-IN")}`}
        />
      </div>
      <span>{month}</span>
    </div>
  );
}

function QuickAction({ icon, text, onClick }) {
  return (
    <button
      type="button"
      className="quick-action-item"
      onClick={onClick}
    >
      <div className="quick-action-icon">{icon}</div>
      <span>{text}</span>
      <ArrowRight size={17} />
    </button>
  );
}

export default Budget;
