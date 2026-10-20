
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  PiggyBank,
  ShieldCheck,
  ShoppingBag,
  Target,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wallet,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { API_BASE_URL } from "../api";
import "./Simulator.css";

const API_ROOT = String(API_BASE_URL || "").trim().replace(/\/+$/, "");

const getStoredUser = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("expenseflow-user") || "null") ||
      {}
    );
  } catch {
    return {};
  }
};

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("expenseflow-token") ||
  "";

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatMonth = (date = new Date()) =>
  date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const getDisplayName = (user) =>
  user?.name ||
  user?.fullName ||
  user?.username ||
  user?.displayName ||
  user?.email?.split("@")?.[0] ||
  "User";

const getInitials = (name) => {
  const words = String(name || "User").trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const getTransactionAmount = (transaction) =>
  Math.abs(Number(transaction?.amount) || 0);

const getTransactionType = (transaction) =>
  String(transaction?.type || "").toLowerCase();

const getMonthTotals = (transactions) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const currentMonthTransactions = transactions.filter((transaction) => {
    if (!transaction?.date) return false;

    const date = new Date(transaction.date);
    return (
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === month &&
      date.getFullYear() === year
    );
  });

  const income = currentMonthTransactions
    .filter((transaction) => getTransactionType(transaction) === "income")
    .reduce((sum, transaction) => sum + getTransactionAmount(transaction), 0);

  const expenses = currentMonthTransactions
    .filter((transaction) => getTransactionType(transaction) === "expense")
    .reduce((sum, transaction) => sum + getTransactionAmount(transaction), 0);

  return { income, expenses };
};

const categories = [
  "Electronics",
  "Shopping",
  "Food",
  "Transport",
  "Bills",
  "Education",
  "Health",
  "Travel",
  "Other",
];

const navigation = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", Icon: CreditCard },
  { label: "Analytics", path: "/analytics", Icon: Activity },
  { label: "Budgets", path: "/budgets", Icon: Wallet },
  { label: "Goals", path: "/goals", Icon: Target },
  { label: "Before You Buy", path: "/simulator", Icon: ShoppingBag },
  { label: "Profile", path: "/profile", Icon: UserRound },
];

const getStatusDetails = (status) => {
  switch (status) {
    case "safe":
      return {
        title: "This purchase looks affordable",
        description:
          "Based on your current monthly income, expenses, and savings target, this purchase fits your available amount.",
        Icon: CheckCircle2,
        className: "safe",
      };

    case "think-again":
      return {
        title: "Think before you buy",
        description:
          "You may be able to afford this purchase, but it could reduce the money available for your savings target.",
        Icon: AlertTriangle,
        className: "think",
      };

    case "not-recommended":
      return {
        title: "Consider postponing this purchase",
        description:
          "This purchase would put your calculated monthly cash flow below zero. Consider saving for it first.",
        Icon: XCircle,
        className: "avoid",
      };

    default:
      return {
        title: "Your purchase analysis",
        description: "Review the numbers below before making your decision.",
        Icon: Activity,
        className: "think",
      };
  }
};

export default function Simulator() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getToken);

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [purchaseType, setPurchaseType] = useState("one-time");
  const [purchaseDate, setPurchaseDate] = useState(getLocalDate());

  const [monthlyIncome, setMonthlyIncome] = useState(
    Math.max(0, Number(getStoredUser()?.monthlyIncome) || 0)
  );
  const [currentExpenses, setCurrentExpenses] = useState(0);
  const [savingsTarget, setSavingsTarget] = useState(
    Math.max(0, Number(getStoredUser()?.savingsTarget) || 0)
  );

  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [simulationError, setSimulationError] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);
  const monthLabel = formatMonth();

  const remainingBeforePurchase = monthlyIncome - currentExpenses;
  const safeToSpend = Math.max(
    0,
    remainingBeforePurchase - savingsTarget
  );

  const apiRequest = useCallback(
    async (path, options = {}) => {
      if (!API_ROOT) {
        throw new Error(
          "Backend URL missing hai. VITE_API_URL ko frontend environment variables mein set karke redeploy karo."
        );
      }

      const response = await fetch(`${API_ROOT}${path}`, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Request failed (${response.status}). Please try again.`
        );
      }

      return result;
    },
    [token]
  );

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getToken());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTransactions = async () => {
      setTransactionsLoading(true);
      setTransactionsError("");

      if (!token) {
        setTransactionsLoading(false);
        setTransactionsError("Please log in to load your financial data.");
        return;
      }

      try {
        const result = await apiRequest("/api/transactions");
        if (cancelled) return;

        const transactions = Array.isArray(result?.transactions)
          ? result.transactions
          : Array.isArray(result?.data?.transactions)
            ? result.data.transactions
            : [];

        const totals = getMonthTotals(transactions);
        const storedUser = getStoredUser();

        const profileIncome = Math.max(
          0,
          Number(storedUser?.monthlyIncome) || 0
        );
        const profileSavingsTarget = Math.max(
          0,
          Number(storedUser?.savingsTarget) || 0
        );

        // Match the backend: use profile monthly income if there are no
        // income transactions for the current month.
        setMonthlyIncome(totals.income > 0 ? totals.income : profileIncome);
        setCurrentExpenses(totals.expenses);
        setSavingsTarget(profileSavingsTarget);
        setNotificationCount(0);
      } catch (error) {
        if (!cancelled) {
          setTransactionsError(error.message || "Could not load transactions.");
        }
      } finally {
        if (!cancelled) setTransactionsLoading(false);
      }
    };

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [apiRequest, token]);

  const handleSimulate = async (event) => {
    event.preventDefault();
    setSimulationError("");
    setSimulation(null);

    const parsedPrice = Number(price);

    if (!token) {
      setSimulationError("Please log in again to simulate a purchase.");
      return;
    }

    if (!itemName.trim()) {
      setSimulationError("Please enter the item name.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setSimulationError("Please enter a valid price greater than ₹0.");
      return;
    }

    if (!category) {
      setSimulationError("Please select a category.");
      return;
    }

    setIsSimulating(true);

    try {
      const result = await apiRequest("/api/simulator", {
        method: "POST",
        body: JSON.stringify({
          itemName: itemName.trim(),
          price: parsedPrice,
          category,
          purchaseType,
          purchaseDate: purchaseDate || null,
        }),
      });

      if (!result?.success || !result?.simulation) {
        throw new Error(result?.message || "Simulation result was not returned.");
      }

      const data = result.simulation;
      setSimulation(data);

      // The server response is the source of truth for the financial figures.
      setMonthlyIncome(Number(data.totalIncome) || 0);
      setCurrentExpenses(Number(data.currentExpenses) || 0);
      setSavingsTarget(Number(data.savingsTarget) || 0);
    } catch (error) {
      setSimulationError(
        error.message || "Unable to simulate this purchase right now."
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("expenseflow-token");
    localStorage.removeItem("user");
    localStorage.removeItem("expenseflow-user");
    navigate("/login");
  };

  const resultDetails = useMemo(
    () => (simulation ? getStatusDetails(simulation.status) : null),
    [simulation]
  );

  const balanceAfter = simulation
    ? Number(simulation.remainingAfterPurchase) || 0
    : remainingBeforePurchase;

  const incomeImpact = simulation
    ? Number(simulation.incomeImpact) || 0
    : 0;

  const expenseImpact = simulation
    ? Number(simulation.expenseImpact) || 0
    : 0;

  return (
    <div className="sim-page">
      <aside className="sim-sidebar">
        <Link to="/dashboard" className="sim-brand">
          <span className="sim-brand-icon">E</span>
          <span>Expense<span>Flow</span></span>
        </Link>

        <div className="sim-nav-caption">WORKSPACE</div>

        <nav className="sim-navigation">
          {navigation.map(({ label, path, Icon }) => (
            <Link
              key={path}
              to={path}
              className={`sim-nav-link ${path === "/simulator" ? "active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {path === "/simulator" && <span className="sim-active-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sim-sidebar-spacer" />

        <div className="sim-sidebar-tip">
          <span className="sim-tip-icon"><ShieldCheck size={19} /></span>
          <strong>Make smarter choices</strong>
          <p>Check your budget before making a big purchase.</p>
          <Link to="/goals">View your goals <ArrowRight size={14} /></Link>
        </div>

        <button type="button" className="sim-logout" onClick={handleLogout}>
          <LogOut size={17} />
          <span>Log out</span>
        </button>
      </aside>

      <main className="sim-main">
        <header className="sim-topbar">
          <div className="sim-topbar-left">
            <span className="sim-breadcrumb">Workspace</span>
            <span className="sim-breadcrumb-separator">/</span>
            <span className="sim-current-page">Before You Buy</span>
          </div>

          <div className="sim-topbar-right">
            <div className="sim-month-pill">
              <CalendarDays size={16} />
              <span>{monthLabel}</span>
            </div>

            <div className="sim-notification-wrap">
              <button
                type="button"
                className="sim-icon-button"
                aria-label="Notifications"
                onClick={() => setShowNotifications((shown) => !shown)}
              >
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="sim-notification-dot" />
                )}
              </button>

              {showNotifications && (
                <div className="sim-notification-popover">
                  <strong>Notifications</strong>
                  <p>
                    {transactionsLoading
                      ? "Loading your financial updates..."
                      : transactionsError
                        ? "Your financial data could not be loaded."
                        : "You’re all caught up. Your financial figures are based on your available account data."}
                  </p>
                </div>
              )}
            </div>

            <Link
              to="/profile"
              className="sim-user-profile"
              title={`Open ${displayName}'s profile`}
            >
              <span className="sim-avatar">{initials}</span>
              <span className="sim-user-details">
                <strong>{displayName}</strong>
                <small>{user?.email || "Personal account"}</small>
              </span>
              <ChevronDown size={15} />
            </Link>
          </div>
        </header>

        <div className="sim-content">
          <section className="sim-welcome">
            <div>
              <div className="sim-eyebrow">
                <span className="sim-eyebrow-line" />
                PERSONAL FINANCE TOOL
              </div>
              <h1>Before you buy, <span>think smart.</span></h1>
              <p>
                See how a purchase could affect your money before you spend it.
              </p>
            </div>

            <div className="sim-welcome-art" aria-hidden="true">
              <div className="sim-art-circle">
                <ShoppingBag size={28} />
              </div>
              <span className="sim-art-spark sim-art-spark-one">✦</span>
              <span className="sim-art-spark sim-art-spark-two">✧</span>
              <span className="sim-art-orbit" />
            </div>
          </section>

          {transactionsError && (
            <div className="sim-alert sim-alert-error">
              <AlertTriangle size={18} />
              <div>
                <strong>Financial data unavailable</strong>
                <p>{transactionsError}</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="sim-retry-button"
              >
                Retry
              </button>
            </div>
          )}

          <section className="sim-stats-grid">
            <article className="sim-stat-card">
              <div className="sim-stat-top">
                <span className="sim-stat-icon income"><TrendingUp size={19} /></span>
                <span className="sim-stat-label">Monthly income</span>
              </div>
              <strong className="sim-stat-value">
                {transactionsLoading ? "Loading..." : formatMoney(monthlyIncome)}
              </strong>
              <span className="sim-stat-foot">Current month · your account</span>
            </article>

            <article className="sim-stat-card">
              <div className="sim-stat-top">
                <span className="sim-stat-icon expense"><TrendingDown size={19} /></span>
                <span className="sim-stat-label">Monthly expenses</span>
              </div>
              <strong className="sim-stat-value">
                {transactionsLoading ? "Loading..." : formatMoney(currentExpenses)}
              </strong>
              <span className="sim-stat-foot">Recorded expense transactions</span>
            </article>

            <article className="sim-stat-card">
              <div className="sim-stat-top">
                <span className="sim-stat-icon savings"><PiggyBank size={19} /></span>
                <span className="sim-stat-label">Savings target</span>
              </div>
              <strong className="sim-stat-value">
                {transactionsLoading ? "Loading..." : formatMoney(savingsTarget)}
              </strong>
              <span className="sim-stat-foot">Your profile preference</span>
            </article>

            <article className="sim-stat-card">
              <div className="sim-stat-top">
                <span className="sim-stat-icon available"><CircleDollarSign size={19} /></span>
                <span className="sim-stat-label">Safe to spend</span>
              </div>
              <strong className="sim-stat-value">
                {transactionsLoading ? "Loading..." : formatMoney(safeToSpend)}
              </strong>
              <span className="sim-stat-foot">After expenses and savings target</span>
            </article>
          </section>

          <div className="sim-workspace-grid">
            <section className="sim-panel sim-form-panel">
              <div className="sim-panel-heading">
                <div>
                  <span className="sim-section-kicker">PURCHASE DETAILS</span>
                  <h2>What are you planning to buy?</h2>
                  <p>Enter the details to calculate the impact on your finances.</p>
                </div>
                <span className="sim-panel-heading-icon"><ShoppingBag size={20} /></span>
              </div>

              <form className="sim-form" onSubmit={handleSimulate}>
                <div className="sim-field">
                  <label htmlFor="sim-item-name">Item name</label>
                  <input
                    id="sim-item-name"
                    type="text"
                    placeholder="e.g. Laptop, phone, headphones"
                    value={itemName}
                    onChange={(event) => setItemName(event.target.value)}
                    maxLength={120}
                    required
                  />
                </div>

                <div className="sim-form-row">
                  <div className="sim-field">
                    <label htmlFor="sim-price">Purchase price (₹)</label>
                    <div className="sim-input-with-icon">
                      <span>₹</span>
                      <input
                        id="sim-price"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="sim-field">
                    <label htmlFor="sim-category">Category</label>
                    <select
                      id="sim-category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      required
                    >
                      {categories.map((entry) => (
                        <option key={entry} value={entry}>{entry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sim-form-row">
                  <div className="sim-field">
                    <label htmlFor="sim-purchase-type">Purchase type</label>
                    <select
                      id="sim-purchase-type"
                      value={purchaseType}
                      onChange={(event) => setPurchaseType(event.target.value)}
                    >
                      <option value="one-time">One-time</option>
                      <option value="recurring">Recurring</option>
                    </select>
                  </div>

                  <div className="sim-field">
                    <label htmlFor="sim-purchase-date">Planned purchase date</label>
                    <input
                      id="sim-purchase-date"
                      type="date"
                      value={purchaseDate}
                      onChange={(event) => setPurchaseDate(event.target.value)}
                    />
                  </div>
                </div>

                {purchaseType === "recurring" && (
                  <p className="sim-inline-note">
                    <AlertTriangle size={15} />
                    The current backend calculation subtracts the entered price once.
                    Recurring costs are not multiplied across the month.
                  </p>
                )}

                <div className="sim-form-summary">
                  <div className="sim-summary-symbol"><Wallet size={19} /></div>
                  <div>
                    <strong>Available before purchase</strong>
                    <span>Income minus recorded expenses</span>
                  </div>
                  <strong className="sim-summary-amount">
                    {formatMoney(remainingBeforePurchase)}
                  </strong>
                </div>

                {simulationError && (
                  <div className="sim-inline-error" role="alert">
                    <AlertTriangle size={17} />
                    <span>{simulationError}</span>
                  </div>
                )}

                <button
                  className="sim-submit-button"
                  type="submit"
                  disabled={isSimulating || transactionsLoading || Boolean(transactionsError)}
                >
                  {isSimulating ? (
                    <>
                      <LoaderCircle size={18} className="sim-spin" />
                      Analysing your finances...
                    </>
                  ) : (
                    <>
                      Simulate purchase
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="sim-form-disclaimer">
                  <ShieldCheck size={14} />
                  Uses your account data to estimate affordability.
                </p>
              </form>
            </section>

            <section className="sim-panel sim-result-panel">
              <div className="sim-panel-heading sim-result-heading">
                <div>
                  <span className="sim-section-kicker">YOUR ANALYSIS</span>
                  <h2>Purchase impact</h2>
                  <p>See the estimated impact before you decide.</p>
                </div>
                <span className="sim-panel-heading-icon"><Activity size={20} /></span>
              </div>

              {!simulation && (
                <div className="sim-empty-result">
                  <div className="sim-empty-illustration">
                    <div className="sim-empty-ring">
                      <ShoppingBag size={29} />
                    </div>
                    <span className="sim-empty-star">✦</span>
                  </div>
                  <h3>Your results will appear here</h3>
                  <p>
                    Add the item and price, then select <strong>Simulate purchase</strong>
                    to get a recommendation based on your account.
                  </p>
                  <div className="sim-empty-mini-stats">
                    <div><span>Income impact</span><strong>—</strong></div>
                    <div><span>Remaining balance</span><strong>—</strong></div>
                  </div>
                </div>
              )}

              {simulation && resultDetails && (
                <div className="sim-results">
                  <div className={`sim-decision-card ${resultDetails.className}`}>
                    <span className="sim-decision-icon">
                      <resultDetails.Icon size={22} />
                    </span>
                    <div>
                      <span className="sim-decision-label">RECOMMENDATION</span>
                      <h3>{resultDetails.title}</h3>
                      <p>{simulation.recommendation || resultDetails.description}</p>
                    </div>
                  </div>

                  <div className="sim-purchase-preview">
                    <span className="sim-purchase-icon"><ShoppingBag size={19} /></span>
                    <div className="sim-purchase-details">
                      <strong>{simulation.itemName}</strong>
                      <span>{simulation.category} · {simulation.purchaseType === "recurring" ? "Recurring" : "One-time"}</span>
                    </div>
                    <strong className="sim-purchase-price">
                      {formatMoney(simulation.price)}
                    </strong>
                  </div>

                  <div className="sim-impact-list">
                    <div className="sim-impact-row">
                      <span className="sim-impact-icon"><TrendingDown size={17} /></span>
                      <div className="sim-impact-copy">
                        <span>Purchase as % of monthly income</span>
                        <strong>{incomeImpact.toFixed(2)}%</strong>
                      </div>
                    </div>

                    <div className="sim-impact-row">
                      <span className="sim-impact-icon"><ArrowDownRight size={17} /></span>
                      <div className="sim-impact-copy">
                        <span>Purchase as % of current expenses</span>
                        <strong>{expenseImpact.toFixed(2)}%</strong>
                      </div>
                    </div>

                    <div className="sim-impact-row">
                      <span className="sim-impact-icon"><Wallet size={17} /></span>
                      <div className="sim-impact-copy">
                        <span>Remaining after purchase</span>
                        <strong className={balanceAfter < 0 ? "sim-negative" : ""}>
                          {formatMoney(balanceAfter)}
                        </strong>
                      </div>
                    </div>

                    <div className="sim-impact-row">
                      <span className="sim-impact-icon"><PiggyBank size={17} /></span>
                      <div className="sim-impact-copy">
                        <span>Safe to spend before purchase</span>
                        <strong>{formatMoney(simulation.safeToSpend)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className={`sim-balance-banner ${balanceAfter < 0 ? "negative" : ""}`}>
                    <div>
                      <span>Estimated balance after purchase</span>
                      <strong>{formatMoney(balanceAfter)}</strong>
                    </div>
                    {balanceAfter < 0 ? (
                      <AlertTriangle size={23} />
                    ) : (
                      <CheckCircle2 size={23} />
                    )}
                  </div>

                  <p className="sim-result-footnote">
                    This estimate uses the current month's recorded transactions and your
                    savings target. It is a budgeting aid, not a guarantee of affordability.
                  </p>
                </div>
              )}
            </section>
          </div>

          <section className="sim-bottom-note">
            <div className="sim-bottom-note-icon"><ShieldCheck size={20} /></div>
            <div>
              <strong>A small check today can protect your savings tomorrow.</strong>
              <p>Review your goals and monthly budget alongside this estimate.</p>
            </div>
            <Link to="/budgets">View budget <ArrowRight size={16} /></Link>
          </section>

          <footer className="sim-footer">
            <span>© {new Date().getFullYear()} ExpenseFlow</span>
            <span>Plan thoughtfully. Spend confidently.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
