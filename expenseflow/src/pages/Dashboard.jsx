
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  TrainFront,
  ShoppingBag,
  Receipt,
  Plane,
  CircleDollarSign,
  CheckCircle2,
  AlertTriangle,
  Info,
  Laptop,
  PiggyBank,
  Crown,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Repeat2,
  ChartNoAxesCombined,
} from "lucide-react";
import API_BASE_URL from "../api";
import "./dashboard.css";

const API_URL = String(API_BASE_URL || "").trim().replace(/\/+$/, "");

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/transactions", label: "Transactions", icon: CreditCard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/budgets", label: "Budgets", icon: Wallet },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/simulator", label: "Before You Buy", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
];

const PERIODS = ["7 Days", "30 Days", "6 Months", "1 Year"];

const CATEGORY_COLORS = [
  "#ff3152",
  "#8b5cf6",
  "#38bdf8",
  "#20d6a1",
  "#f59e0b",
  "#64748b",
  "#ec4899",
  "#a3e635",
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const numberValue = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    return Number(value.replace(/[₹,\s]/g, "")) || 0;
  }

  return 0;
};

const getArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.transactions)) return response.transactions;
  if (Array.isArray(response?.goals)) return response.goals;
  if (Array.isArray(response?.budgets)) return response.budgets;
  if (Array.isArray(response?.data?.transactions)) {
    return response.data.transactions;
  }
  if (Array.isArray(response?.data?.goals)) return response.data.goals;
  if (Array.isArray(response?.data?.budgets)) return response.data.budgets;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const getDate = (item) => {
  const value =
    item?.date ||
    item?.transactionDate ||
    item?.createdAt ||
    item?.created_at;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const getUserName = (user) =>
  user?.fullName ||
  user?.name ||
  user?.username ||
  user?.displayName ||
  user?.user?.name ||
  user?.user?.username ||
  user?.email?.split("@")[0] ||
  "User";

const getUserEmail = (user) => user?.email || user?.user?.email || "";

const getTransactionAmount = (item) =>
  numberValue(
    item?.amount ??
      item?.value ??
      item?.total ??
      item?.transactionAmount
  );

const isIncome = (item) => {
  const type = String(
    item?.type || item?.transactionType || item?.kind || ""
  ).toLowerCase();

  if (["income", "credit", "earning", "deposit"].includes(type)) {
    return true;
  }

  if (["expense", "debit", "spending", "withdrawal"].includes(type)) {
    return false;
  }

  return (
    item?.isIncome === true ||
    item?.isExpense === false ||
    String(item?.category || "").toLowerCase() === "income"
  );
};

const getTransactionName = (item) =>
  item?.title ||
  item?.description ||
  item?.name ||
  item?.merchant ||
  item?.note ||
  "Transaction";

const getCategory = (item) =>
  item?.category?.name ||
  item?.categoryName ||
  (typeof item?.category === "string" ? item.category : "") ||
  (isIncome(item) ? "Income" : "Other");

const getGoalTarget = (goal) =>
  numberValue(
    goal?.targetAmount ??
      goal?.target ??
      goal?.goalAmount ??
      goal?.amount ??
      goal?.totalAmount
  );

const getGoalSaved = (goal) =>
  numberValue(
    goal?.savedAmount ??
      goal?.currentAmount ??
      goal?.saved ??
      goal?.currentSavings ??
      goal?.amountSaved
  );

const getGoalName = (goal) =>
  goal?.title || goal?.name || goal?.goalName || "Savings goal";

const goalIcon = (name) => {
  const value = String(name).toLowerCase();

  if (/laptop|computer|phone|device|gadget|tech/.test(value)) {
    return Laptop;
  }

  if (/emergency|saving|fund|money/.test(value)) {
    return PiggyBank;
  }

  if (/trip|travel|holiday|goa|flight/.test(value)) {
    return Plane;
  }

  return Target;
};

const categoryIcon = (category) => {
  const value = String(category).toLowerCase();

  if (/food|grocery|dining|restaurant/.test(value)) return Utensils;
  if (/transport|travel|metro|fuel|cab/.test(value)) return TrainFront;
  if (/shop|amazon|clothes/.test(value)) return ShoppingBag;
  if (/bill|utility|rent|recharge/.test(value)) return Receipt;
  if (/income|salary|earning/.test(value)) return CircleDollarSign;

  return Wallet;
};

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function inSelectedMonth(item, monthKey) {
  const date = getDate(item);
  return date ? getMonthKey(date) === monthKey : false;
}

function getPeriodStart(period, monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const start = new Date(year, month - 1, 1);

  if (period === "7 Days") {
    start.setTime(end.getTime());
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (period === "30 Days") {
    start.setTime(end.getTime());
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  } else if (period === "6 Months") {
    start.setMonth(start.getMonth() - 5, 1);
  } else if (period === "1 Year") {
    start.setMonth(start.getMonth() - 11, 1);
  }

  return { start, end };
}

function getScoreColor(score) {
  if (score < 40) return "#ff3152";
  if (score < 70) return "#f59e0b";
  return "#20d6a1";
}

/* Normalize expense names so extra spaces and capitalization do not
   prevent recurring expense detection. */
function normalizeExpenseName(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

/* Find expenses appearing in at least two different months. */
function getRecurringExpenses(transactions) {
  const groups = new Map();

  transactions
    .filter((item) => !isIncome(item))
    .forEach((item) => {
      const date = getDate(item);
      if (!date) return;

      const originalName = getTransactionName(item).trim();
      const normalizedName = normalizeExpenseName(originalName);

      if (!normalizedName) return;

      if (!groups.has(normalizedName)) {
        groups.set(normalizedName, {
          name: originalName,
          amounts: [],
          months: new Set(),
          latestDate: date,
        });
      }

      const group = groups.get(normalizedName);
      const amount = Math.abs(getTransactionAmount(item));

      group.amounts.push(amount);
      group.months.add(getMonthKey(date));

      if (date > group.latestDate) {
        group.latestDate = date;
        group.name = originalName;
      }
    });

  return [...groups.values()]
    .filter((group) => group.months.size >= 2)
    .map((group) => ({
      ...group,
      average:
        group.amounts.reduce((sum, amount) => sum + amount, 0) /
        group.amounts.length,
      occurrences: group.months.size,
      totalPaid: group.amounts.reduce((sum, amount) => sum + amount, 0),
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);
}

/* Forecast from the three complete months before the selected month. */
function getExpenseForecast(transactions, selectedMonth) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthlyTotals = [];

  for (let offset = 1; offset <= 3; offset += 1) {
    const date = new Date(year, month - 1 - offset, 1);
    const monthKey = getMonthKey(date);

    const total = transactions
      .filter(
        (item) =>
          !isIncome(item) && inSelectedMonth(item, monthKey)
      )
      .reduce(
        (sum, item) => sum + Math.abs(getTransactionAmount(item)),
        0
      );

    monthlyTotals.push({
      month: monthKey,
      total,
    });
  }

  const monthsWithData = monthlyTotals.filter((item) => item.total > 0);

  const average = monthsWithData.length
    ? monthsWithData.reduce((sum, item) => sum + item.total, 0) /
      monthsWithData.length
    : 0;

  return {
    average: Math.round(average),
    monthsAvailable: monthsWithData.length,
    values: monthlyTotals,
  };
}

function Dashboard() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("30 Days");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getMonthKey(new Date())
  );
  const [didAutoSelectMonth, setDidAutoSelectMonth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const userName = getUserName(user);
  const userEmail = getUserEmail(user);
  const avatar = getInitials(userName);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    } catch {
      setUser({});
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!API_URL || !token) {
        setTransactions([]);
        setGoals([]);
        setBudgets([]);
        setLoading(false);
        setLoadError(
          !token
            ? "Please log in to see your personal financial data."
            : "Backend URL is missing. Check your VITE_API_URL configuration."
        );
        return;
      }

      setLoading(true);
      setLoadError("");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const requests = [
        ["/api/transactions", setTransactions],
        ["/api/goals", setGoals],
        ["/api/budgets", setBudgets],
      ];

      const results = await Promise.all(
        requests.map(async ([path, setter]) => {
          try {
            const response = await fetch(`${API_URL}${path}`, { headers });

            if (!response.ok) {
              throw new Error(`${path}: HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!cancelled) setter(getArray(data));
            return { ok: true, path };
          } catch (error) {
            console.warn(`Dashboard data unavailable (${path}):`, error);

            if (!cancelled) setter([]);
            return { ok: false, path };
          }
        })
      );

      if (!cancelled) {
        if (results.every((result) => !result.ok)) {
          setLoadError(
            "Could not load dashboard data. Check your backend API routes and connection."
          );
        }

        setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // When the dashboard first finishes loading, show the newest month that
  // actually has transactions if the current month has no recorded activity.
  // The user can still change the month manually after this initial selection.
  useEffect(() => {
    if (loading || didAutoSelectMonth || transactions.length === 0) return;

    const currentMonthHasTransactions = transactions.some((item) =>
      inSelectedMonth(item, selectedMonth)
    );

    if (!currentMonthHasTransactions) {
      const latestTransactionDate = transactions
        .map(getDate)
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime())[0];

      if (latestTransactionDate) {
        setSelectedMonth(getMonthKey(latestTransactionDate));
      }
    }

    setDidAutoSelectMonth(true);
  }, [loading, didAutoSelectMonth, transactions, selectedMonth]);

  const monthTransactions = useMemo(
    () => transactions.filter((item) => inSelectedMonth(item, selectedMonth)),
    [transactions, selectedMonth]
  );

  const currentIncome = useMemo(
    () =>
      monthTransactions
        .filter(isIncome)
        .reduce(
          (total, item) => total + Math.abs(getTransactionAmount(item)),
          0
        ),
    [monthTransactions]
  );

  const currentExpenses = useMemo(
    () =>
      monthTransactions
        .filter((item) => !isIncome(item))
        .reduce(
          (total, item) => total + Math.abs(getTransactionAmount(item)),
          0
        ),
    [monthTransactions]
  );

  const previousMonthKey = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return getMonthKey(new Date(year, month - 2, 1));
  }, [selectedMonth]);

  const previousMonthTransactions = useMemo(
    () => transactions.filter((item) => inSelectedMonth(item, previousMonthKey)),
    [transactions, previousMonthKey]
  );

  const previousIncome = previousMonthTransactions
    .filter(isIncome)
    .reduce((sum, item) => sum + Math.abs(getTransactionAmount(item)), 0);

  const previousExpenses = previousMonthTransactions
    .filter((item) => !isIncome(item))
    .reduce((sum, item) => sum + Math.abs(getTransactionAmount(item)), 0);

  const totalIncome = transactions
    .filter(isIncome)
    .reduce((sum, item) => sum + Math.abs(getTransactionAmount(item)), 0);

  const totalExpenses = transactions
    .filter((item) => !isIncome(item))
    .reduce((sum, item) => sum + Math.abs(getTransactionAmount(item)), 0);

  const balance =
    numberValue(user?.balance ?? user?.totalBalance) ||
    totalIncome - totalExpenses;

  const budgetTotal = budgets
    .filter((budget) => {
      const date = budget?.month || budget?.date || budget?.createdAt;

      if (!date) return true;

      const parsed = new Date(date);

      return (
        Number.isNaN(parsed.getTime()) ||
        getMonthKey(parsed) === selectedMonth
      );
    })
    .reduce(
      (sum, budget) =>
        sum +
        numberValue(
          budget?.limit ??
            budget?.budgetAmount ??
            budget?.amount ??
            budget?.monthlyLimit
        ),
      0
    );

  const monthlyIncome =
    currentIncome > 0
      ? currentIncome
      : Math.max(0, numberValue(user?.monthlyIncome));

  const savingsTarget = Math.max(0, numberValue(user?.savingsTarget));

  const remainingAfterExpenses = monthlyIncome - currentExpenses;

  const safeToSpend = Math.max(
    0,
    Math.min(
      remainingAfterExpenses - savingsTarget,
      budgetTotal > 0
        ? budgetTotal - currentExpenses
        : remainingAfterExpenses - savingsTarget
    )
  );

  const expenseChange =
    previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : 0;

  const incomeChange =
    previousIncome > 0
      ? ((currentIncome - previousIncome) / previousIncome) * 100
      : 0;

  /* Dynamic spending totals grouped by the transaction's real category. */
  const categoryData = useMemo(() => {
    const totals = new Map();

    monthTransactions
      .filter((item) => !isIncome(item))
      .forEach((item) => {
        const category = getCategory(item);
        const amount = Math.abs(getTransactionAmount(item));

        totals.set(category, (totals.get(category) || 0) + amount);
      });

    const total = [...totals.values()].reduce((sum, value) => sum + value, 0);

    return [...totals.entries()]
      .map(([name, amount], index) => ({
        name,
        amount,
        percentage: total ? Math.round((amount / total) * 100) : 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  const categoryTotal = useMemo(
    () => categoryData.reduce((sum, item) => sum + item.amount, 0),
    [categoryData]
  );

  /* Donut segments are calculated from category totals, not unrelated values. */
  const donutStyle = useMemo(() => {
    if (!categoryTotal || !categoryData.length) {
      return {
        background: "conic-gradient(#253039 0deg 360deg)",
      };
    }

    let cursor = 0;

    const stops = categoryData.map((item) => {
      const start = cursor;
      cursor += (item.amount / categoryTotal) * 360;
      return `${item.color} ${start}deg ${cursor}deg`;
    });

    return {
      background: `conic-gradient(${stops.join(", ")})`,
    };
  }, [categoryData, categoryTotal]);

  const trendData = useMemo(() => {
    const { start, end } = getPeriodStart(selectedPeriod, selectedMonth);
    const bucketMap = new Map();

    const count =
      selectedPeriod === "7 Days"
        ? 7
        : selectedPeriod === "30 Days"
          ? 30
          : selectedPeriod === "6 Months"
            ? 6
            : 12;

    for (let i = 0; i < count; i += 1) {
      const date = new Date(start);

      if (selectedPeriod === "7 Days" || selectedPeriod === "30 Days") {
        date.setDate(start.getDate() + i);
      } else {
        date.setMonth(start.getMonth() + i, 1);
      }

      const key =
        selectedPeriod === "7 Days" || selectedPeriod === "30 Days"
          ? getMonthKey(date) + `-${String(date.getDate()).padStart(2, "0")}`
          : getMonthKey(date);

      bucketMap.set(key, {
        key,
        date,
        income: 0,
        expenses: 0,
      });
    }

    transactions.forEach((item) => {
      const date = getDate(item);

      if (!date || date < start || date > end) return;

      const key =
        selectedPeriod === "7 Days" || selectedPeriod === "30 Days"
          ? getMonthKey(date) + `-${String(date.getDate()).padStart(2, "0")}`
          : getMonthKey(date);

      if (!bucketMap.has(key)) return;

      const bucket = bucketMap.get(key);

      if (isIncome(item)) {
        bucket.income += Math.abs(getTransactionAmount(item));
      } else {
        bucket.expenses += Math.abs(getTransactionAmount(item));
      }
    });

    return [...bucketMap.values()];
  }, [transactions, selectedPeriod, selectedMonth]);

  const chartPaths = useMemo(() => {
    const maxValue = Math.max(
      1,
      ...trendData.flatMap((item) => [item.income, item.expenses])
    );

    const width = 760;
    const height = 220;
    const padX = 8;
    const padY = 12;

    const makePoints = (key) =>
      trendData.map((item, index) => {
        const x =
          trendData.length <= 1
            ? width / 2
            : padX +
              (index / (trendData.length - 1)) * (width - padX * 2);

        const y =
          height -
          padY -
          (item[key] / maxValue) * (height - padY * 2);

        return { x, y };
      });

    const toString = (points) =>
      points.map((point) => `${point.x},${point.y}`).join(" ");

    return {
      income: toString(makePoints("income")),
      expenses: toString(makePoints("expenses")),
      max: maxValue,
    };
  }, [trendData]);

  const recentTransactions = useMemo(
    () =>
      [...monthTransactions]
        .sort(
          (a, b) =>
            (getDate(b)?.getTime() || 0) - (getDate(a)?.getTime() || 0)
        )
        .slice(0, 5),
    [monthTransactions]
  );

  const goalData = useMemo(
    () =>
      goals.slice(0, 4).map((goal, index) => {
        const target = getGoalTarget(goal);
        const saved = getGoalSaved(goal);

        const percentage =
          target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

        return {
          ...goal,
          title: getGoalName(goal),
          saved,
          target,
          percentage,
          Icon: goalIcon(getGoalName(goal)),
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        };
      }),
    [goals]
  );

  const recurringExpenses = useMemo(
    () => getRecurringExpenses(transactions),
    [transactions]
  );

  const expenseForecast = useMemo(
    () => getExpenseForecast(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const budgetUsage =
    budgetTotal > 0
      ? Math.min(100, Math.round((currentExpenses / budgetTotal) * 100))
      : null;

  const savingsRate =
    currentIncome > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((currentIncome - currentExpenses) / currentIncome) * 100
          )
        )
      : 0;

  const financialScore = Math.round(
    currentIncome === 0 && currentExpenses === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            savingsRate * 0.65 +
              (budgetUsage === null
                ? 20
                : Math.max(0, 100 - budgetUsage) * 0.35)
          )
        )
  );

  const scoreColor = getScoreColor(financialScore);
  const circumference = 2 * Math.PI * 48;
  const scoreOffset =
    circumference * (1 - Math.max(0, Math.min(100, financialScore)) / 100);

  const notifications = useMemo(() => {
    const list = [];

    if (categoryData[0]) {
      list.push({
        id: "top-category",
        icon: ArrowUpRight,
        type: "red",
        text: `${categoryData[0].name} is your highest spending category this month (${money(categoryData[0].amount)}).`,
        time: getMonthLabel(selectedMonth),
      });
    }

    if (budgetUsage !== null) {
      list.push({
        id: "budget-usage",
        icon: AlertTriangle,
        type: budgetUsage >= 80 ? "yellow" : "green",
        text: `You have used ${budgetUsage}% of your monthly budget.`,
        time: `${money(budgetTotal - currentExpenses)} remaining`,
      });
    }

    const nextGoal = goalData.find(
      (goal) => goal.percentage > 0 && goal.percentage < 100
    );

    if (nextGoal) {
      list.push({
        id: "goal-progress",
        icon: Target,
        type: "green",
        text: `${nextGoal.title} is ${nextGoal.percentage}% complete.`,
        time: `${money(nextGoal.saved)} saved`,
      });
    }

    if (recurringExpenses.length) {
      list.push({
        id: "recurring",
        icon: Repeat2,
        type: "yellow",
        text: `${recurringExpenses.length} recurring expense(s) detected from your transaction history.`,
        time: "Spending pattern",
      });
    }

    if (!list.length) {
      list.push({
        id: "welcome",
        icon: Info,
        type: "green",
        text: "Add transactions, budgets and goals to see personalized updates here.",
        time: "Getting started",
      });
    }

    return list;
  }, [
    categoryData,
    budgetUsage,
    budgetTotal,
    currentExpenses,
    goalData,
    recurringExpenses,
    selectedMonth,
  ]);

  const unreadNotifications = notifications.filter(
    (item) => !readNotifications.includes(item.id)
  ).length;

  const markNotificationsRead = () => {
    setReadNotifications(notifications.map((item) => item.id));
  };

  const changeMonth = (amount) => {
    const [year, month] = selectedMonth.split("-").map(Number);

    setSelectedMonth(getMonthKey(new Date(year, month - 1 + amount, 1)));
  };

  const monthOptions = useMemo(() => {
    const options = [];
    const [year, month] = selectedMonth.split("-").map(Number);

    for (let offset = -12; offset <= 1; offset += 1) {
      options.push(getMonthKey(new Date(year, month - 1 + offset, 1)));
    }

    return [...new Set(options)].sort().reverse();
  }, [selectedMonth]);

  return (
    <div className="new-dashboard">
      <aside className="new-dashboard-sidebar">
        <Link to="/dashboard" className="new-dashboard-logo">
          <div className="new-logo-box">E</div>
          <span>
            Expense<span>Flow</span>
          </span>
        </Link>

        <nav className="new-dashboard-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `new-nav-item${isActive ? " active" : ""}`
              }
            >
              <Icon size={21} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="upgrade-card">
          <div className="upgrade-icon">
            <Crown size={20} />
          </div>
          <h3>Upgrade to Pro</h3>
          <p>Get advanced insights and smart recommendations.</p>
          <Link to="/analytics" className="upgrade-action">
            Explore insights <ArrowRight size={16} />
          </Link>
        </div>
      </aside>

      <main className="new-dashboard-main">
        <header className="new-dashboard-header">
          <div className="dashboard-welcome">
            <h1>Hello, {userName} 👋</h1>
            <p>Here's your financial overview.</p>
            {userEmail && (
              <span className="dashboard-user-email">{userEmail}</span>
            )}
          </div>

          <div className="dashboard-header-actions">
            <div className="dashboard-month-control">
              <button
                type="button"
                className="dashboard-month-button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                ‹
              </button>

              <CalendarDays size={18} />

              <select
                aria-label="Select dashboard month"
                className="dashboard-month-select"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              >
                {monthOptions.map((month) => (
                  <option value={month} key={month}>
                    {getMonthLabel(month)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="dashboard-month-next"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="notification-wrapper">
              <button
                type="button"
                className="notification-button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => {
                  setShowNotifications((current) => !current);
                  setShowProfileMenu(false);
                }}
              >
                <Bell size={21} />
                {unreadNotifications > 0 && (
                  <span className="notification-count">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <strong>Notifications</strong>
                    <button type="button" onClick={markNotificationsRead}>
                      Mark all read
                    </button>
                  </div>

                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    const isRead = readNotifications.includes(notification.id);

                    return (
                      <div
                        key={notification.id}
                        className={`notification-row ${isRead ? "is-read" : ""}`}
                      >
                        <span className={`notification-icon ${notification.type}`}>
                          <Icon size={17} />
                        </span>

                        <div>
                          <p>{notification.text}</p>
                          <small>{notification.time}</small>
                        </div>

                        {!isRead && (
                          <span className="notification-unread-dot" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="dashboard-profile-wrapper">
              <button
                type="button"
                className="dashboard-profile-button"
                aria-expanded={showProfileMenu}
                onClick={() => {
                  setShowProfileMenu((current) => !current);
                  setShowNotifications(false);
                }}
              >
                <div className="dashboard-avatar">{avatar}</div>
                <ChevronDown size={16} />
              </button>

              {showProfileMenu && (
                <div className="dashboard-profile-menu">
                  <strong>{userName}</strong>
                  {userEmail && <small>{userEmail}</small>}

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User size={16} /> My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.href = "/login";
                    }}
                  >
                    <ArrowRight size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {loadError && (
          <div className="dashboard-data-message" role="status">
            <Info size={18} />
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        )}

        <section className="new-stat-grid">
          <StatCard
            type="balance"
            icon={<Wallet size={22} />}
            title="Total Balance"
            value={money(balance)}
            change={
              previousMonthTransactions.length
                ? `${Math.abs(
                    Math.round(
                      ((currentIncome -
                        currentExpenses -
                        (previousIncome - previousExpenses)) /
                        Math.max(
                          1,
                          Math.abs(previousIncome - previousExpenses)
                        )) *
                        100
                    )
                  )}% vs last month`
                : "Based on loaded transactions"
            }
            positive={balance >= 0}
          />

          <StatCard
            type="income"
            icon={<ArrowUpRight size={22} />}
            title="Monthly Income"
            value={money(currentIncome)}
            change={`${Math.abs(Math.round(incomeChange))}% vs last month`}
            positive={incomeChange >= 0}
          />

          <StatCard
            type="expense"
            icon={<ArrowDownRight size={22} />}
            title="Monthly Expenses"
            value={money(currentExpenses)}
            change={`${Math.abs(Math.round(expenseChange))}% vs last month`}
            positive={expenseChange <= 0}
          />

          <StatCard
            type="safe"
            icon={<CircleDollarSign size={22} />}
            title="Safe to Spend"
            value={money(safeToSpend)}
            customText={
              savingsTarget > 0
                ? "After expenses and savings target"
                : budgetTotal > 0
                  ? "Based on remaining budget"
                  : "Income minus expenses"
            }
          />
        </section>

        <section className="dashboard-chart-grid">
          <div className="dashboard-box spending-box">
            <div className="dashboard-box-header trend-header">
              <div>
                <h2>Spending Trend</h2>
                <p>Income vs expenses · {getMonthLabel(selectedMonth)}</p>
              </div>

              <div className="period-buttons">
                {PERIODS.map((period) => (
                  <button
                    type="button"
                    key={period}
                    className={selectedPeriod === period ? "selected" : ""}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="chart-legend-new">
              <span>
                <i className="legend-dot income-dot" /> Income
              </span>
              <span>
                <i className="legend-dot expense-dot" /> Expenses
              </span>
            </div>

            <div className="line-chart-wrapper">
              <div className="chart-y-labels">
                <span>{money(chartPaths.max)}</span>
                <span>{money(chartPaths.max * 0.75)}</span>
                <span>{money(chartPaths.max * 0.5)}</span>
                <span>{money(chartPaths.max * 0.25)}</span>
                <span>₹0</span>
              </div>

              <div className="dashboard-chart-plot">
                <svg
                  className="line-chart"
                  viewBox="0 0 760 220"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Income and expenses based on your transactions"
                >
                  {[12, 61, 110, 159, 208].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="760"
                      y2={y}
                      className="chart-grid-line"
                    />
                  ))}

                  {trendData.length > 0 && (
                    <>
                      <polyline
                        points={chartPaths.income}
                        fill="none"
                        stroke="#20d6a1"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <polyline
                        points={chartPaths.expenses}
                        fill="none"
                        stroke="#ff3152"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>

            <div className="chart-x-labels">
              {trendData
                .filter((item, index) => {
                  const interval = Math.max(1, Math.ceil(trendData.length / 6));
                  return index % interval === 0 || index === trendData.length - 1;
                })
                .map((item) => (
                  <span key={item.key}>
                    {selectedPeriod === "7 Days" || selectedPeriod === "30 Days"
                      ? item.date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : item.date.toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                  </span>
                ))}
            </div>

            {!loading && monthTransactions.length === 0 && (
              <p className="dashboard-empty-note">
                No transactions found for {getMonthLabel(selectedMonth)}.
              </p>
            )}
          </div>

          <div className="dashboard-box category-box">
            <div className="dashboard-box-header">
              <div>
                <h2>Spending by Category</h2>
                <p>Where your money goes</p>
              </div>
              <span className="category-month-label">
                {getMonthLabel(selectedMonth)}
              </span>
            </div>

            <div className="category-chart">
              <div className="donut" style={donutStyle}>
                <div className="donut-inner">
                  <strong>{money(categoryTotal)}</strong>
                  <span>Total Spent</span>
                </div>
              </div>

              <div className="category-list">
                {categoryData.length ? (
                  categoryData.slice(0, 6).map((category) => (
                    <div className="category" key={category.name}>
                      <span className="category-name">
                        <i style={{ background: category.color }} />
                        <span title={category.name}>{category.name}</span>
                      </span>

                      <span className="category-amount">
                        <strong>{category.percentage}%</strong>
                        <small>{money(category.amount)}</small>
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="dashboard-empty-note">
                    No expense categories for this month yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-feature-grid">
          <div className="dashboard-box feature-card">
            <div className="dashboard-box-header">
              <div>
                <h2>
                  <Repeat2 size={20} /> Recurring Expenses
                </h2>
                <p>Repeated payments detected in your history</p>
              </div>
            </div>

            {recurringExpenses.length ? (
              <div className="feature-list">
                {recurringExpenses.map((item) => (
                  <div className="feature-row" key={normalizeExpenseName(item.name)}>
                    <div className="feature-row-icon">
                      <RefreshCw size={17} />
                    </div>
                    <div className="feature-row-info">
                      <strong>{item.name}</strong>
                      <small>
                        Seen in {item.occurrences} different months
                      </small>
                    </div>
                    <strong>{money(item.average)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-state compact">
                <Repeat2 size={23} />
                <strong>No recurring expenses detected yet</strong>
                <span>
                  Similar expense names in at least two different months
                  will appear here.
                </span>
              </div>
            )}
          </div>

          <div className="dashboard-box feature-card">
            <div className="dashboard-box-header">
              <div>
                <h2>
                  <ChartNoAxesCombined size={20} /> Expense Forecast
                </h2>
                <p>Estimate based on the previous three complete months</p>
              </div>
            </div>

            <div className="feature-forecast">
              <span>Estimated monthly expenses</span>
              <strong className="feature-forecast-value">
                {money(expenseForecast.average)}
              </strong>
              <p>
                {expenseForecast.monthsAvailable
                  ? `Calculated from ${expenseForecast.monthsAvailable} month(s) with recorded expenses.`
                  : "Add expenses from previous months to build your forecast."}
              </p>
            </div>

            <div className="feature-forecast-footer">
              <span>Selected month</span>
              <strong>{getMonthLabel(selectedMonth)}</strong>
            </div>

            {expenseForecast.monthsAvailable > 0 && (
              <div className="feature-list">
                {expenseForecast.values.map((item) => (
                  <div className="feature-row" key={item.month}>
                    <div className="feature-row-info">
                      <strong>{getMonthLabel(item.month)}</strong>
                      <small>
                        {item.total > 0 ? "Recorded expenses" : "No expenses recorded"}
                      </small>
                    </div>
                    <strong>{money(item.total)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <div className="dashboard-box transactions-box">
            <div className="dashboard-box-header">
              <h2>Recent Transactions</h2>
              <Link to="/transactions" className="dashboard-view-all">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="transaction-list">
              {recentTransactions.length ? (
                recentTransactions.map((transaction, index) => {
                  const category = getCategory(transaction);
                  const Icon = categoryIcon(category);
                  const income = isIncome(transaction);
                  const amount = Math.abs(getTransactionAmount(transaction));

                  return (
                    <div
                      className="new-transaction-row"
                      key={
                        transaction._id ||
                        transaction.id ||
                        `${getTransactionName(transaction)}-${index}`
                      }
                    >
                      <div
                        className={`transaction-new-icon ${
                          income ? "income" : "expense"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="transaction-new-info">
                        <strong>{getTransactionName(transaction)}</strong>
                        <span>{category}</span>
                      </div>

                      <span className="transaction-new-date">
                        {formatDate(getDate(transaction))}
                      </span>

                      <strong
                        className={
                          income ? "transaction-income" : "transaction-expense"
                        }
                      >
                        {income ? "+" : "−"}
                        {money(amount)}
                      </strong>

                      <ArrowRight size={16} className="transaction-arrow" />
                    </div>
                  );
                })
              ) : (
                <div className="dashboard-empty-state">
                  <CreditCard size={25} />
                  <strong>No transactions yet</strong>
                  <span>Your recent transactions will appear here.</span>
                  <Link to="/transactions">Add a transaction</Link>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-box health-box">
            <div className="dashboard-box-header">
              <div>
                <h2>Financial Health</h2>
                <p>Your money wellness score</p>
              </div>
            </div>

            <div className="health-content">
              <div className="health-circle">
                <svg
                  viewBox="0 0 120 120"
                  role="img"
                  aria-label={`Financial health ${financialScore} out of 100`}
                >
                  <circle cx="60" cy="60" r="48" className="health-bg" />

                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="health-progress"
                    stroke={scoreColor}
                    strokeDasharray={circumference}
                    strokeDashoffset={scoreOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>

                <div className="health-number">
                  <strong>{financialScore}</strong>
                  <span>/100</span>
                </div>
              </div>

              <div className="health-message">
                <strong style={{ color: scoreColor }}>
                  {financialScore >= 75
                    ? "You're doing great!"
                    : financialScore >= 45
                      ? "You're making progress!"
                      : financialScore > 0
                        ? "Let's improve your score"
                        : "Start tracking your money"}
                </strong>

                <HealthPoint
                  good={currentIncome > currentExpenses && currentIncome > 0}
                  text={
                    currentIncome > currentExpenses && currentIncome > 0
                      ? "Income is above expenses"
                      : "Track income and expenses"
                  }
                />

                <HealthPoint
                  good={budgetUsage !== null && budgetUsage < 80}
                  text={
                    budgetUsage === null
                      ? "Add a monthly budget"
                      : budgetUsage >= 80
                        ? "Budget usage is high"
                        : "Spending within budget"
                  }
                />

                <HealthPoint
                  good={savingsRate >= 20}
                  text={`Savings rate: ${Math.round(savingsRate)}%`}
                />
              </div>
            </div>

            <Link to="/analytics" className="health-button">
              View Analysis <ArrowRight size={16} />
            </Link>
          </div>

          <div className="dashboard-box goals-progress-box">
            <div className="dashboard-box-header">
              <h2>Goals Progress</h2>
              <Link to="/goals" className="dashboard-view-all">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="dashboard-goals-list">
              {goalData.length ? (
                goalData.map((goal, index) => {
                  const Icon = goal.Icon;

                  return (
                    <div
                      className="dashboard-goal-row"
                      key={goal._id || goal.id || `${goal.title}-${index}`}
                    >
                      <div className="dashboard-goal-main">
                        <div className="dashboard-goal-title">
                          <strong title={goal.title}>{goal.title}</strong>
                          <span>{goal.percentage}%</span>
                        </div>

                        <div className="dashboard-goal-progress">
                          <div
                            style={{
                              width: `${goal.percentage}%`,
                              background: goal.color,
                            }}
                          />
                          <span
                            className="goal-moving-icon"
                            style={{
                              left: `${Math.min(96, Math.max(4, goal.percentage))}%`,
                              color: goal.color,
                            }}
                          >
                            <Icon size={17} />
                          </span>
                        </div>

                        <div className="dashboard-goal-amounts">
                          <span>{money(goal.saved)} saved</span>
                          <span>Target {money(goal.target)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="dashboard-empty-state compact">
                  <Target size={23} />
                  <strong>No goals added</strong>
                  <span>Create a goal to track your progress here.</span>
                  <Link to="/goals">Create a goal</Link>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-box insights-box">
            <div className="dashboard-box-header">
              <h2>
                <Lightbulb size={20} /> Money Insights
              </h2>
              <Link to="/analytics" className="dashboard-view-all">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="insight-cards">
              <div className="insight-card">
                <span className="insight-icon red">
                  <ArrowUpRight size={19} />
                </span>
                <p>
                  {categoryData[0]
                    ? `${categoryData[0].name} is your highest spending category at ${money(categoryData[0].amount)}.`
                    : "Add expenses to see your top spending category."}
                </p>
              </div>

              <div className="insight-card">
                <span className="insight-icon green">
                  <ArrowDownRight size={19} />
                </span>
                <p>
                  {previousExpenses > 0
                    ? `Expenses ${
                        expenseChange <= 0 ? "decreased" : "increased"
                      } by ${Math.abs(Math.round(expenseChange))}% compared with last month.`
                    : "Your month-over-month spending trend will appear here."}
                </p>
              </div>

              <div className="insight-card">
                <span className="insight-icon blue">
                  <Info size={19} />
                </span>
                <p>
                  {money(safeToSpend)} available after considering your current
                  expenses and savings target.
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-box before-buy">
            <div className="buy-icon">
              <ShoppingCart size={20} />
            </div>
            <h2>Before You Buy</h2>
            <p>
              Thinking about a purchase? See how it could affect your goals and
              budget.
            </p>
            <Link to="/simulator" className="before-buy-button">
              Simulate Purchase <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {loading && (
          <div className="dashboard-loading" role="status">
            <RefreshCw size={16} /> Loading your financial data…
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  type,
  icon,
  title,
  value,
  change,
  positive,
  customText,
}) {
  return (
    <div className={`new-stat-card ${type}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-info">
        <span>{title}</span>
        <strong>{value}</strong>
        <small className={positive ? "positive" : "negative"}>
          {customText || change}
        </small>
      </div>
      <ArrowRight size={19} className="stat-card-arrow" />
    </div>
  );
}

function HealthPoint({ good, text }) {
  const Icon = good ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`health-point ${good ? "good" : "warning"}`}>
      <Icon size={15} />
      <span>{text}</span>
    </div>
  );
}

export default Dashboard;
