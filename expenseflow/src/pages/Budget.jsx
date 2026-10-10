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
  SlidersHorizontal,
  Sparkles,
  BarChart4,
  Bell,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Pencil,
  Trash2,
  Save,
  BellRing,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import "./Budget.css";


const categoryOptions = [
  {
    name: "Food & Dining",
    backendName: "Food",
    iconKey: "food",
    color: "pink",
  },
  {
    name: "Shopping",
    backendName: "Shopping",
    iconKey: "shopping",
    color: "orange",
  },
  {
    name: "Transport",
    backendName: "Transport",
    iconKey: "transport",
    color: "blue",
  },
  {
    name: "Bills & Utilities",
    backendName: "Bills",
    iconKey: "bills",
    color: "purple",
  },
  {
    name: "Entertainment",
    backendName: "Entertainment",
    iconKey: "entertainment",
    color: "violet",
  },
  {
    name: "Health & Fitness",
    backendName: "Health",
    iconKey: "health",
    color: "red",
  },
  {
    name: "Personal Care",
    backendName: "Personal Care",
    iconKey: "personal",
    color: "green",
  },
  {
    name: "Others",
    backendName: "Others",
    iconKey: "others",
    color: "gray",
  },
];


const iconMap = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  bills: FileText,
  entertainment: Gamepad2,
  health: Heart,
  personal: Leaf,
  others: MoreHorizontal,
};


const monthOptions = [
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
];


const getMonthKey = (month) => {
  const date = new Date(`${month} 01`);

  if (Number.isNaN(date.getTime())) {
    return month;
  }

  const year = date.getFullYear();
  const monthNumber = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${monthNumber}`;
};

const getCategoryByBackendName = (backendName) => {
  return categoryOptions.find(
    (category) =>
      category.backendName === backendName
  );
};


function Budget() {
  const navigate = useNavigate();


  const [budgets, setBudgets] = useState([]);

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [selectedMonth, setSelectedMonth] =
    useState("September 2026");

  const [viewMonth, setViewMonth] =
    useState("This Month");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingBudget, setEditingBudget] =
    useState(null);

  const [menuOpen, setMenuOpen] =
    useState(null);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [budgetAlerts, setBudgetAlerts] =
    useState(() => {
      return (
        localStorage.getItem(
          "expenseflow-budget-alerts"
        ) === "true"
      );
    });

  const [formData, setFormData] = useState({
    name: "Food & Dining",
    budget: "",
  });

 

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


  const currentMonthKey =
    getMonthKey(selectedMonth);


  const fetchBudgets = async () => {
    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/budgets?month=${encodeURIComponent(
          currentMonthKey
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to fetch budgets."
        );
        return;
      }

      setBudgets(data.budgets || []);
    } catch (error) {
      console.error(
        "Fetch Budgets Error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure the backend is running."
      );
    }
  };


  const fetchTransactions = async () => {
    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/transactions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to fetch transactions."
        );
        return;
      }

      setTransactions(
        data.transactions || []
      );
    } catch (error) {
      console.error(
        "Fetch Transactions Error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchBudgets(),
        fetchTransactions(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem(
      "expenseflow-budget-alerts",
      String(budgetAlerts)
    );
  }, [budgetAlerts]);


  const monthlyIncome = useMemo(() => {
    const user =
      JSON.parse(
        localStorage.getItem("user") ||
          "null"
      );

    return Number(
      user?.monthlyIncome || 60000
    );
  }, []);


  const getSpentForCategory = (
    backendCategory
  ) => {
    return transactions
      .filter((transaction) => {
        if (
          transaction.type !==
          "expense"
        ) {
          return false;
        }

        const transactionDate =
          new Date(transaction.date);

        if (
          Number.isNaN(
            transactionDate.getTime()
          )
        ) {
          return false;
        }

        const transactionYear =
          transactionDate.getFullYear();

        const transactionMonth =
          String(
            transactionDate.getMonth() + 1
          ).padStart(2, "0");

        const transactionMonthKey = `${transactionYear}-${transactionMonth}`;

        if (
          transactionMonthKey !==
          currentMonthKey
        ) {
          return false;
        }

        return (
          transaction.category ===
          backendCategory
        );
      })
      .reduce(
        (total, transaction) =>
          total +
          Number(
            transaction.amount || 0
          ),
        0
      );
  };


  const displayBudgets = useMemo(() => {
    return budgets.map((budget) => {
      const category =
        getCategoryByBackendName(
          budget.category
        );

      const spent =
        getSpentForCategory(
          budget.category
        );

      return {
        ...budget,

        id: budget._id,

        name:
          category?.name ||
          budget.category,

        spent,

        budget: Number(
          budget.amount || 0
        ),

        iconKey:
          category?.iconKey ||
          "others",

        color:
          category?.color ||
          "gray",
      };
    });
  }, [
    budgets,
    transactions,
    currentMonthKey,
  ]);


  const totalBudgeted = useMemo(() => {
    return displayBudgets.reduce(
      (total, item) =>
        total +
        Number(item.budget || 0),
      0
    );
  }, [displayBudgets]);

  const totalSpent = useMemo(() => {
    return displayBudgets.reduce(
      (total, item) =>
        total +
        Number(item.spent || 0),
      0
    );
  }, [displayBudgets]);

  const remaining =
    totalBudgeted - totalSpent;

  const budgetPercentage =
    monthlyIncome > 0
      ? Math.round(
          (totalBudgeted /
            monthlyIncome) *
            100
        )
      : 0;

  const remainingPercentage =
    monthlyIncome > 0
      ? Math.round(
          (Math.max(
            remaining,
            0
          ) /
            monthlyIncome) *
            100
        )
      : 0;

  const warningBudgets =
    displayBudgets.filter(
      (item) => {
        if (!item.budget) {
          return false;
        }

        return (
          Number(item.spent) /
            Number(item.budget) >=
          0.8
        );
      }
    );


  const openCreateModal = () => {
    setEditingBudget(null);

    setFormData({
      name: "Food & Dining",
      budget: "",
    });

    setMenuOpen(null);
    setModalOpen(true);
  };


  const openEditModal = (item) => {
    setEditingBudget(item);

    const category =
      getCategoryByBackendName(
        item.category
      );

    setFormData({
      name:
        category?.name ||
        item.name,
      budget: String(
        item.budget
      ),
    });

    setMenuOpen(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingBudget(null);
  };


  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleSaveBudget = async (
    event
  ) => {
    event.preventDefault();

    const budgetAmount =
      Number(formData.budget);

    if (
      !formData.name ||
      !Number.isFinite(
        budgetAmount
      ) ||
      budgetAmount <= 0
    ) {
      alert(
        "Please enter a valid budget amount."
      );

      return;
    }

    const selectedCategory =
      categoryOptions.find(
        (category) =>
          category.name ===
          formData.name
      );

    if (!selectedCategory) {
      alert(
        "Please select a valid category."
      );

      return;
    }

    const alreadyExists =
      budgets.some(
        (item) =>
          item.category ===
            selectedCategory.backendName &&
          item._id !==
            editingBudget?._id
      );

    if (alreadyExists) {
      alert(
        "This category already has a budget for this month."
      );

      return;
    }

    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/budgets",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            category:
              selectedCategory.backendName,

            amount: budgetAmount,

            month:
              currentMonthKey,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to save budget."
        );

        return;
      }
      setBudgets((previous) => {
        const exists =
          previous.some(
            (item) =>
              item._id ===
              data.budget._id
          );

        if (exists) {
          return previous.map(
            (item) =>
              item._id ===
              data.budget._id
                ? data.budget
                : item
          );
        }

        return [
          ...previous,
          data.budget,
        ];
      });

      closeModal();
    } catch (error) {
      console.error(
        "Save Budget Error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    } finally {
      setSaving(false);
    }
  };


  const deleteBudget = async (id) => {
    const selectedBudget =
      displayBudgets.find(
        (item) => item.id === id
      );

    if (!selectedBudget) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${selectedBudget.name}" budget?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      setDeletingId(id);

      const response = await fetch(
        `http://localhost:5000/api/budgets/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to delete budget."
        );

        return;
      }

      setBudgets((previous) =>
        previous.filter(
          (item) =>
            item._id !== id
        )
      );

      setMenuOpen(null);
    } catch (error) {
      console.error(
        "Delete Budget Error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    } finally {
      setDeletingId(null);
    }
  };


  const autoAllocateBudget = async () => {
    const available =
      monthlyIncome -
      totalBudgeted;

    if (available <= 0) {
      alert(
        "There is no unallocated income left."
      );

      return;
    }

    const othersBudget =
      displayBudgets.find(
        (item) =>
          item.name === "Others"
      );

    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      if (othersBudget) {
        const response =
          await fetch(
            "http://localhost:5000/api/budgets",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                category: "Others",

                amount:
                  Number(
                    othersBudget.budget
                  ) +
                  available,

                month:
                  currentMonthKey,
              }),
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          alert(
            data.message ||
              "Unable to allocate budget."
          );

          return;
        }

        setBudgets((previous) =>
          previous.map(
            (item) =>
              item._id ===
              data.budget._id
                ? data.budget
                : item
          )
        );
      } else {
        const response =
          await fetch(
            "http://localhost:5000/api/budgets",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                category: "Others",

                amount:
                  available,

                month:
                  currentMonthKey,
              }),
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          alert(
            data.message ||
              "Unable to allocate budget."
          );

          return;
        }

        setBudgets((previous) => [
          ...previous,
          data.budget,
        ]);
      }

      alert(
        `₹${available.toLocaleString(
          "en-IN"
        )} was automatically allocated.`
      );
    } catch (error) {
      console.error(
        "Auto Allocate Error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    }
  };


  const resetBudgets = async () => {
    const confirmed =
      window.confirm(
        "Delete all budgets for this month?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      for (const budget of budgets) {
        await fetch(
          `http://localhost:5000/api/budgets/${budget._id}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setBudgets([]);
      setMenuOpen(null);
    } catch (error) {
      console.error(
        "Reset Budgets Error:",
        error
      );

      alert(
        "Unable to reset budgets."
      );
    }
  };



  return (
    <div className="budget-page">


      <aside className="budget-sidebar">

        <Link
          to="/"
          className="budget-logo"
        >
          <div className="budget-logo-box">
            E
          </div>

          <span>
            Expense<span>Flow</span>
          </span>
        </Link>

        <nav className="budget-navigation">

          <Link
            to="/dashboard"
            className="budget-nav-item"
          >
            <Home size={20} />
            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/transactions"
            className="budget-nav-item"
          >
            <CreditCard size={20} />
            <span>
              Transactions
            </span>
          </Link>

          <Link
            to="/analytics"
            className="budget-nav-item"
          >
            <BarChart3 size={20} />
            <span>
              Analytics
            </span>
          </Link>

          <Link
            to="/budgets"
            className="budget-nav-item active"
          >
            <Wallet size={20} />
            <span>
              Budgets
            </span>
          </Link>

          <Link
            to="/goals"
            className="budget-nav-item"
          >
            <Target size={20} />
            <span>
              Goals
            </span>
          </Link>

          <Link
            to="/simulator"
            className="budget-nav-item"
          >
            <ShoppingCart size={20} />
            <span>
              Before You Buy
            </span>
          </Link>

          <Link
            to="/profile"
            className="budget-nav-item"
          >
            <User size={20} />
            <span>
              Profile
            </span>
          </Link>

        </nav>

        {/* SMART TIP */}

        <div className="budget-smart-tip">

          <div className="budget-tip-icon">
            <Lightbulb size={25} />
          </div>

          <h3>
            Smart Tip
          </h3>

          <p>
            A clear budget today
            means a stress-free
            tomorrow!
          </p>

        </div>

      </aside>

      <main className="budget-main">

        {/* TOP BAR */}

        <header className="budget-topbar">

          <div></div>

          <div className="budget-top-actions">

            {/* MONTH */}

            <div className="budget-dropdown-wrapper">

              <CalendarDays size={17} />

              <select
                className="budget-month-select"
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(
                    event.target.value
                  )
                }
              >
                {monthOptions.map(
                  (month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  )
                )}
              </select>

              <ChevronDown size={15} />

            </div>

            {/* NOTIFICATION */}

            <div className="budget-notification-wrapper">

              <button
                className="budget-notification"
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (previous) =>
                      !previous
                  )
                }
              >

                <Bell size={20} />

                {warningBudgets.length >
                  0 && (
                  <span></span>
                )}

              </button>

              {showNotifications && (
                <div className="budget-notification-dropdown">

                  <strong>
                    Budget Alerts
                  </strong>

                  {warningBudgets.length >
                  0 ? (
                    <p>
                      {
                        warningBudgets.length
                      }{" "}
                      {warningBudgets.length ===
                      1
                        ? "category is"
                        : "categories are"}{" "}
                      close to the
                      budget limit.
                    </p>
                  ) : (
                    <p>
                      All categories are
                      currently under
                      control.
                    </p>
                  )}

                </div>
              )}

            </div>

            {/* AVATAR */}

            <div className="budget-avatar">
              V
            </div>

          </div>

        </header>

        {/* HEADING */}

        <section className="budget-heading">

          <div>

            <h1>
              Budgets
            </h1>

            <p>
              Plan your spending, stay in
              control, and achieve your goals.
            </p>

          </div>

          <button
            type="button"
            className="create-budget-button"
            onClick={
              openCreateModal
            }
          >
            <Plus size={19} />
            Create Budget
          </button>

        </section>

        {/* SUMMARY */}

        <section className="budget-summary">

          {/* INCOME */}

          <div className="budget-summary-card">

            <div className="budget-summary-icon blue">
              <Wallet size={25} />
            </div>

            <div>

              <strong>
                ₹
                {monthlyIncome.toLocaleString(
                  "en-IN"
                )}
              </strong>

              <span>
                Monthly Income
              </span>

            </div>

          </div>

          {/* TOTAL BUDGET */}

          <div className="budget-summary-card">

            <div className="budget-summary-icon pink">
              <BarChart4 size={25} />
            </div>

            <div>

              <strong>
                ₹
                {totalBudgeted.toLocaleString(
                  "en-IN"
                )}
              </strong>

              <span>
                Total Budgeted
              </span>

              <small className="budget-green-text">
                {budgetPercentage}% of income
              </small>

            </div>

          </div>

          {/* REMAINING */}

          <div className="budget-summary-card">

            <div className="budget-summary-icon orange">
              <Wallet size={25} />
            </div>

            <div>

              <strong>
                ₹
                {remaining.toLocaleString(
                  "en-IN"
                )}
              </strong>

              <span>
                Remaining
              </span>

              <small className="budget-green-text">
                {remainingPercentage}% of income
              </small>

            </div>

          </div>

          {/* DAYS */}

          <div className="budget-summary-card">

            <div className="budget-summary-icon blue">
              <CalendarDays size={25} />
            </div>

            <div>

              <strong>
                {new Date(
                  2026,
                  new Date(
                    `${selectedMonth} 01`
                  ).getMonth() + 1,
                  0
                ).getDate()}{" "}
                days
              </strong>

              <span>
                In selected month
              </span>

            </div>

          </div>

        </section>

        {/* CONTENT GRID */}

        <section className="budget-content-grid">

          {/* LEFT */}

          <div className="budget-left">

            {/* BUDGET CATEGORIES */}

            <div className="budget-panel categories-panel">

              <div className="budget-panel-header">

                <div>

                  <h2>
                    Budget Categories
                  </h2>

                </div>

                <div className="budget-view">

                  <span>
                    View:
                  </span>

                  <select
                    value={viewMonth}
                    onChange={(event) =>
                      setViewMonth(
                        event.target.value
                      )
                    }
                  >
                    <option>
                      This Month
                    </option>

                    <option>
                      Last Month
                    </option>

                    <option>
                      Next Month
                    </option>
                  </select>

                </div>

              </div>

              {/* TABLE HEADER */}

              <div className="budget-table-header">

                <span>
                  Category
                </span>

                <span>
                  Spent
                </span>

                <span>
                  Budget
                </span>

                <span>
                  Progress
                </span>

                <span></span>

              </div>

              {/* CATEGORY LIST */}

              <div className="budget-category-list">

                {loading ? (
                  <div className="budget-empty">

                    <Wallet size={35} />

                    <h3>
                      Loading budgets...
                    </h3>

                    <p>
                      Getting your budgets
                      from MongoDB.
                    </p>

                  </div>
                ) : (
                  displayBudgets.map(
                    (item) => {

                      const Icon =
                        iconMap[
                          item.iconKey
                        ] ||
                        MoreHorizontal;

                      const percentage =
                        item.budget > 0
                          ? Math.round(
                              (Number(
                                item.spent
                              ) /
                                Number(
                                  item.budget
                                )) *
                                100
                            )
                          : 0;

                      const warning =
                        percentage >=
                        80;

                      return (
                        <div
                          className="budget-category-row"
                          key={item.id}
                        >

                          {/* CATEGORY */}

                          <div className="budget-category-name">

                            <div
                              className={`budget-category-icon ${item.color}`}
                            >
                              <Icon
                                size={17}
                              />
                            </div>

                            <span>
                              {item.name}
                            </span>

                          </div>

                          {/* SPENT */}

                          <strong>
                            ₹
                            {Number(
                              item.spent
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          {/* BUDGET */}

                          <strong>
                            ₹
                            {Number(
                              item.budget
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          {/* PROGRESS */}

                          <div className="budget-progress-area">

                            <div className="budget-progress">

                              <div
                                className={
                                  warning
                                    ? "warning"
                                    : ""
                                }
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`,
                                }}
                              ></div>

                            </div>

                            <span>
                              {percentage}%
                            </span>

                          </div>

                          {/* MORE */}

                          <div className="budget-more-wrapper">

                            <button
                              type="button"
                              className="budget-more"
                              disabled={
                                deletingId ===
                                item.id
                              }
                              onClick={() =>
                                setMenuOpen(
                                  menuOpen ===
                                    item.id
                                    ? null
                                    : item.id
                                )
                              }
                            >
                              <MoreHorizontal
                                size={19}
                              />
                            </button>

                            {menuOpen ===
                              item.id && (
                              <div className="budget-action-menu">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      item
                                    )
                                  }
                                >
                                  <Pencil
                                    size={15}
                                  />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="delete"
                                  onClick={() =>
                                    deleteBudget(
                                      item.id
                                    )
                                  }
                                >
                                  <Trash2
                                    size={15}
                                  />
                                  Delete
                                </button>

                              </div>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )
                )}

                {/* EMPTY STATE */}

                {!loading &&
                  displayBudgets.length ===
                    0 && (
                    <div className="budget-empty">

                      <Wallet size={35} />

                      <h3>
                        No budgets yet
                      </h3>

                      <p>
                        Create your first
                        budget to start
                        tracking spending.
                      </p>

                      <button
                        type="button"
                        onClick={
                          openCreateModal
                        }
                      >
                        <Plus size={17} />
                        Create Budget
                      </button>

                    </div>
                  )}

              </div>

            </div>

            {/* AI INSIGHTS */}

            <div className="budget-panel budget-insights">

              <div className="insights-heading">

                <div className="insights-icon">
                  <Sparkles size={23} />
                </div>

                <h2>
                  AI Budget Insights
                </h2>

              </div>

              <div className="insight-row">

                <CheckCircle2 size={19} />

                <span>
                  You're doing great!
                  You're within budget
                  for most categories.
                </span>

              </div>

              {warningBudgets.length >
                0 && (
                <div className="insight-row warning">

                  <AlertCircle size={19} />

                  <span>
                    {warningBudgets
                      .map(
                        (item) =>
                          item.name
                      )
                      .join(", ")}{" "}
                    {warningBudgets.length ===
                    1
                      ? "is"
                      : "are"}{" "}
                    close to the
                    budget limit.
                  </span>

                </div>
              )}

              <div className="insight-row">

                <CheckCircle2 size={19} />

                <span>
                  You can still spend ₹
                  {Math.max(
                    remaining,
                    0
                  ).toLocaleString(
                    "en-IN"
                  )}{" "}
                  this month.
                </span>

              </div>

              <div className="insight-row blue">

                <Lightbulb size={19} />

                <span>
                  Keep essential
                  categories under
                  control to improve
                  your savings.
                </span>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="budget-right">

            {/* BUDGET OVERVIEW */}

            <div className="budget-panel overview-panel">

              <h2>
                Budget Overview
              </h2>

              <div className="overview-content">

                <div
                  className="budget-donut"
                  style={{
                    background:
                      "conic-gradient(#ff304f 0deg 162deg, #4d9fff 162deg 270deg, #ff9d42 270deg 324deg, #4b5057 324deg 360deg)",
                  }}
                >

                  <div className="budget-donut-inner">

                    <strong>
                      ₹
                      {totalSpent.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <span>
                      Spent
                    </span>

                  </div>

                </div>

                <div className="overview-legend">

                  <Legend
                    color="green"
                    name="Needs"
                    value="45%"
                  />

                  <Legend
                    color="blue"
                    name="Wants"
                    value="30%"
                  />

                  <Legend
                    color="orange"
                    name="Savings & Goals"
                    value="15%"
                  />

                  <Legend
                    color="gray"
                    name="Others"
                    value="10%"
                  />

                </div>

              </div>

            </div>

            {/* MONTHLY TREND */}

            <div className="budget-panel monthly-trend">

              <h2>
                Monthly Budget Trend
              </h2>

              <div className="trend-chart">

                <div className="trend-values">

                  <span>
                    60K
                  </span>

                  <span>
                    40K
                  </span>

                  <span>
                    20K
                  </span>

                  <span>
                    0
                  </span>

                </div>

                <div className="trend-bars">

                  <TrendBar
                    month="Apr"
                    height="55%"
                  />

                  <TrendBar
                    month="May"
                    height="68%"
                  />

                  <TrendBar
                    month="Jun"
                    height="77%"
                  />

                  <TrendBar
                    month="Jul"
                    height="70%"
                  />

                  <TrendBar
                    month="Aug"
                    height="88%"
                  />

                  <TrendBar
                    month="Sep"
                    height="82%"
                    active
                  />

                </div>

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="budget-panel quick-actions">

              <h2>
                Quick Actions
              </h2>

              <QuickAction
                icon={
                  <SlidersHorizontal
                    size={18}
                  />
                }
                text="Adjust Budget"
                onClick={
                  openCreateModal
                }
              />

              <QuickAction
                icon={
                  <Sparkles size={18} />
                }
                text="Auto-Allocate Budget"
                onClick={
                  autoAllocateBudget
                }
              />

              <QuickAction
                icon={
                  <BarChart4 size={18} />
                }
                text="View Spending Analytics"
                onClick={() =>
                  navigate(
                    "/analytics"
                  )
                }
              />

              <QuickAction
                icon={
                  <BellRing size={18} />
                }
                text={
                  budgetAlerts
                    ? "Disable Budget Alerts"
                    : "Set Budget Alerts"
                }
                onClick={() =>
                  setBudgetAlerts(
                    (previous) =>
                      !previous
                  )
                }
              />

              <button
                type="button"
                className="quick-action-item reset-budget-action"
                onClick={
                  resetBudgets
                }
              >

                <div className="quick-action-icon">
                  <Trash2 size={18} />
                </div>

                <span>
                  Reset Month Budgets
                </span>

                <ArrowRight
                  size={17}
                />

              </button>

            </div>

          </div>

        </section>

      </main>


      {modalOpen && (
        <div
          className="budget-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="budget-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="budget-modal-header">

              <div>

                <span>
                  {editingBudget
                    ? "UPDATE BUDGET"
                    : "NEW BUDGET"}
                </span>

                <h2>
                  {editingBudget
                    ? "Edit Budget"
                    : "Create Budget"}
                </h2>

              </div>

              <button
                type="button"
                className="budget-modal-close"
                onClick={
                  closeModal
                }
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSaveBudget
              }
            >

              {/* CATEGORY */}

              <div className="budget-form-group">

                <label>
                  Category
                </label>

                <select
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={
                    Boolean(
                      editingBudget
                    ) || saving
                  }
                >

                  {categoryOptions.map(
                    (category) => (
                      <option
                        key={
                          category.name
                        }
                        value={
                          category.name
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* BUDGET AMOUNT */}

              <div className="budget-form-group">

                <label>
                  Budget Amount
                </label>

                <div className="budget-input-with-symbol">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="budget"
                    min="1"
                    placeholder="5000"
                    value={
                      formData.budget
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={saving}
                    required
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="budget-form-actions">

                <button
                  type="button"
                  className="budget-cancel-button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="budget-save-button"
                  disabled={saving}
                >

                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : editingBudget
                    ? "Save Changes"
                    : "Create Budget"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

function Legend({
  color,
  name,
  value,
}) {
  return (
    <div className="budget-legend-item">

      <span
        className={`legend-dot ${color}`}
      ></span>

      <span>
        {name}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

/* =========================================================
   TREND BAR COMPONENT
========================================================= */

function TrendBar({
  month,
  height,
  active = false,
}) {
  return (
    <div className="trend-bar-item">

      <div className="trend-bar-wrapper">

        <div
          className={
            active
              ? "trend-bar active"
              : "trend-bar"
          }
          style={{
            height,
          }}
        ></div>

      </div>

      <span>
        {month}
      </span>

    </div>
  );
}

function QuickAction({
  icon,
  text,
  onClick,
}) {
  return (
    <button
      type="button"
      className="quick-action-item"
      onClick={onClick}
    >

      <div className="quick-action-icon">
        {icon}
      </div>

      <span>
        {text}
      </span>

      <ArrowRight size={17} />

    </button>
  );
}


export default Budget;