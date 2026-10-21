import {
  Home,
  CreditCard,
  BarChart3,
  Wallet,
  Target,
  ShoppingCart,
  User,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ChevronDown,
  Utensils,
  Bus,
  ShoppingBag,
  Receipt,
  Gamepad2,
  MoreHorizontal,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Analytics.css";
import API_BASE_URL from "../api";

const categoryIcons = {
  Food: Utensils,
  Transport: Bus,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Housing: Wallet,
  Health: TrendingUp,
  "Personal Care": User,
  Others: MoreHorizontal,
};


const categoryClasses = {
  Food: "food",
  Transport: "transport",
  Shopping: "shopping",
  Bills: "bills",
  Entertainment: "entertainment",
  Housing: "housing",
  Health: "health",
  "Personal Care": "personal-care",
  Others: "others",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getCurrentMonthValue() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonthLabel(value) {
  const [year, month] = value.split("-");

  return `${monthNames[Number(month) - 1]} ${year}`;
}

function getPreviousMonth(value) {
  const [yearString, monthString] = value.split("-");

  let year = Number(yearString);
  let month = Number(monthString) - 1;

  month -= 1;

  if (month < 0) {
    month = 11;
    year -= 1;
  }

  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getLastNMonths(value, count) {
  const months = [];
  let current = value;
  for (let i = 0; i < count; i++) {
    months.unshift(current);
    current = getPreviousMonth(current);
  }
  return months;
}

function getPeriodMonths(period, selectedMonth) {
  if (period === "Last Month") return [getPreviousMonth(selectedMonth)];
  if (period === "Last 3 Months") return getLastNMonths(selectedMonth, 3);
  return [selectedMonth];
}



function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatAxisValue(amount) {
  const value = Number(amount || 0);
  if (value >= 100000) return `${(value / 1000).toFixed(0)}K`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.round(value)}`;
}



function Analytics() {


  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonthValue());

  const [chartPeriod, setChartPeriod] =
    useState("Last 6 Months");

  const [breakdownPeriod, setBreakdownPeriod] =
    useState("This Month");

  const [categoryPeriod, setCategoryPeriod] =
    useState("This Month");

  const [selectedCategory, setSelectedCategory] =
    useState("Food");

  const [merchantPeriod, setMerchantPeriod] =
    useState("This Month");

  const [analyticsData, setAnalyticsData] =
    useState(null);

  const [previousData, setPreviousData] =
    useState(null);

  const [monthlyHistory, setMonthlyHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const monthsToFetch = getLastNMonths(selectedMonth, 12);
        const results = await Promise.all(
          monthsToFetch.map(async (monthValue) => {
            const [year, month] = monthValue.split("-");
            const response = await fetch(
              `${API_BASE_URL}/api/analytics?month=${Number(month) - 1}&year=${year}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
              throw new Error("Your session expired. Please log in again.");
            }

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
              return { month: monthValue, data: null, error: result.message };
            }
            return { month: monthValue, data: result };
          })
        );

        if (cancelled) return;
        const current = results.find((item) => item.month === selectedMonth);
        if (!current?.data) {
          throw new Error(current?.error || "Unable to load analytics for this month.");
        }

        setAnalyticsData(current.data);
        const previousMonth = getPreviousMonth(selectedMonth);
        const previous = results.find((item) => item.month === previousMonth);
        setPreviousData(previous?.data || null);
        setMonthlyHistory(results.filter((item) => item.data));
      } catch (err) {
        if (!cancelled) {
          console.error("Analytics Fetch Error:", err);
          setError(err.message || "Unable to load analytics.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="analytics-loading-page">
        <div className="analytics-loading-box">
          <RefreshCw
            size={28}
            className="analytics-loading-icon"
          />

          <h2>
            Loading Analytics...
          </h2>

          <p>
            Fetching your financial insights.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-loading-page">
        <div className="analytics-error-box">
          <div className="analytics-error-icon">
            !
          </div>

          <h2>
            Analytics couldn't load
          </h2>

          <p>{error}</p>

          <button
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  const summary = analyticsData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    savingsPercentage: 0,
    totalBudget: 0,
    budgetUsage: 0,
  };

  const previousIncome = previousData?.summary?.totalIncome || 0;
  const previousExpenses = previousData?.summary?.totalExpenses || 0;
  const incomeChange = previousIncome > 0
    ? Math.round(((summary.totalIncome - previousIncome) / previousIncome) * 100)
    : 0;
  const expenseChange = previousExpenses > 0
    ? Math.round(((summary.totalExpenses - previousExpenses) / previousExpenses) * 100)
    : 0;
  const savingsRate = Number(summary.savingsPercentage || 0);

  const displayedMonthlyTrend = getLastNMonths(
    selectedMonth,
    chartPeriod === "Last 3 Months" ? 3 : chartPeriod === "Last 12 Months" ? 12 : 6
  ).map((month) => {
    const data = monthlyHistory.find((item) => item.month === month)?.data;
    return {
      month,
      income: Number(data?.summary?.totalIncome || 0),
      expenses: Number(data?.summary?.totalExpenses || 0),
    };
  });
  const maxTrendValue = Math.max(
    ...displayedMonthlyTrend.flatMap((item) => [item.income, item.expenses]),
    1000
  );

  const categoriesForPeriod = (period) => {
    const monthSet = new Set(getPeriodMonths(period, selectedMonth));
    const sums = new Map();
    monthlyHistory.filter((item) => monthSet.has(item.month)).forEach(({ data }) => {
      (data.categories || []).forEach((category) => {
        const name = category.category || "Others";
        sums.set(name, (sums.get(name) || 0) + Number(category.amount || 0));
      });
    });
    const total = [...sums.values()].reduce((sum, amount) => sum + amount, 0);
    return [...sums.entries()]
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        icon: categoryIcons[category] || MoreHorizontal,
        className: categoryClasses[category] || "others",
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categories = (analyticsData?.categories || []).map((category) => ({
    ...category,
    icon: categoryIcons[category.category] || MoreHorizontal,
    className: categoryClasses[category.category] || "others",
  }));
  const breakdownCategories = categoriesForPeriod(breakdownPeriod);
  const spendingCategories = categoriesForPeriod(categoryPeriod);
  const categoryTrendData = getLastNMonths(selectedMonth, 6).map((month) => {
    const data = monthlyHistory.find((item) => item.month === month)?.data;
    const category = data?.categories?.find((item) => item.category === selectedCategory);
    return { month, amount: Number(category?.amount || 0) };
  });
  const categoryTrendMax = Math.max(...categoryTrendData.map((item) => item.amount), 1000);

  const topCategory = analyticsData?.topCategory || categories[0] || {
    category: "No Data", amount: 0, percentage: 0,
  };

  const merchantMap = {};
  const merchantMonths = new Set(getPeriodMonths(merchantPeriod, selectedMonth));
  monthlyHistory.filter((item) => merchantMonths.has(item.month)).forEach(({ data }) => {
    (data.recentTransactions || []).forEach((transaction) => {
      if (String(transaction.type || "").toLowerCase() === "income") return;
      const merchantName = transaction.title || transaction.description || transaction.merchant || "Other";
      if (!merchantMap[merchantName]) merchantMap[merchantName] = { name: merchantName, amount: 0, transactions: 0 };
      merchantMap[merchantName].amount += Math.abs(Number(transaction.amount || 0));
      merchantMap[merchantName].transactions += 1;
    });
  });
  const merchants = Object.values(merchantMap).sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxMerchantAmount = Math.max(...merchants.map((merchant) => merchant.amount), 1);
  const categoryTotal = breakdownCategories.reduce((sum, category) => sum + Number(category.amount || 0), 0);

  const donutColors = [
    "#ff3151",
    "#ffbd3f",
    "#4285ff",
    "#a15cff",
    "#36cfad",
    "#d6dce2",
    "#ff7a45",
    "#8b5cf6",
  ];

  let donutStart = 0;

  const donutSegments =
    breakdownCategories.map(
      (category, index) => {
        const percentage =
          categoryTotal > 0
            ? (category.amount /
                categoryTotal) *
              100
            : 0;

        const start =
          donutStart;

        donutStart += percentage;

        return `${donutColors[index % donutColors.length]} ${start}% ${donutStart}%`;
      }
    );

  const donutBackground =
    donutSegments.length > 0
      ? `conic-gradient(${donutSegments.join(
          ", "
        )})`
      : "#252933";
  return (
    <div className="analytics-dashboard">


      <aside className="analytics-sidebar">

        <Link
          to="/"
          className="analytics-logo"
        >
          <div className="analytics-logo-box">
            E
          </div>

          <span>
            Expense<span>Flow</span>
          </span>
        </Link>

        <nav className="analytics-nav">

          <Link
            to="/dashboard"
            className="analytics-nav-item"
          >
            <Home size={21} />
            Dashboard
          </Link>

          <Link
            to="/transactions"
            className="analytics-nav-item"
          >
            <CreditCard size={21} />
            Transactions
          </Link>

          <Link
            to="/analytics"
            className="analytics-nav-item active"
          >
            <BarChart3 size={21} />
            Analytics
          </Link>

          <Link
            to="/budgets"
            className="analytics-nav-item"
          >
            <Wallet size={21} />
            Budgets
          </Link>

          <Link
            to="/goals"
            className="analytics-nav-item"
          >
            <Target size={21} />
            Goals
          </Link>

          <Link
            to="/simulator"
            className="analytics-nav-item"
          >
            <ShoppingCart size={21} />
            Before You Buy
          </Link>

          <Link
            to="/profile"
            className="analytics-nav-item"
          >
            <User size={21} />
            Profile
          </Link>

        </nav>

        <div className="analytics-smart-tip">

          <div className="smart-tip-icon">
            <Lightbulb size={22} />
          </div>

          <strong>
            Smart Tip
          </strong>

          <p>
            Track your spending patterns
            to make better financial
            decisions.
          </p>

        </div>

      </aside>
      <main className="analytics-main">

        {/* HEADER */}

        <header className="analytics-top-header">

          <div className="analytics-heading">

            <div className="analytics-heading-icon">
              <BarChart3 size={34} />
            </div>

            <div>
              <h1>
                Analytics
              </h1>

              <p>
                Understand your spending
                patterns and make smarter
                financial decisions.
              </p>
            </div>

          </div>

          <div className="analytics-month-selector">

            <CalendarDays size={16} />

            <select
              className="analytics-date-button"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
            >
              {Array.from(
                { length: 12 },
                (_, index) => {
                  const year =
                    new Date().getFullYear();

                  const month =
                    String(index + 1).padStart(
                      2,
                      "0"
                    );

                  return (
                    <option
                      key={`${year}-${month}`}
                      value={`${year}-${month}`}
                    >
                      {monthNames[index]}{" "}
                      {year}
                    </option>
                  );
                }
              )}
            </select>

            <ChevronDown size={15} />

          </div>

        </header>


        <section className="analytics-summary-grid">

          {/* INCOME */}

          <div className="analytics-stat-card">

            <div className="stat-icon income">
              <TrendingUp size={25} />
            </div>

            <div className="stat-content">

              <span>
                Total Income
              </span>

              <strong>
                {formatMoney(
                  summary.totalIncome
                )}
              </strong>

              <small
                className={
                  incomeChange >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {incomeChange >= 0 ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}

                <b>
                  {Math.abs(
                    incomeChange
                  )}%
                </b>

                {" "}vs last month
              </small>

            </div>

          </div>

          {/* EXPENSE */}

          <div className="analytics-stat-card">

            <div className="stat-icon expense">
              <TrendingDown size={25} />
            </div>

            <div className="stat-content">

              <span>
                Total Expenses
              </span>

              <strong>
                {formatMoney(
                  summary.totalExpenses
                )}
              </strong>

              <small
                className={
                  expenseChange <= 0
                    ? "positive"
                    : "negative"
                }
              >
                {expenseChange <= 0 ? (
                  <ArrowDownRight size={13} />
                ) : (
                  <ArrowUpRight size={13} />
                )}

                <b>
                  {Math.abs(
                    expenseChange
                  )}%
                </b>

                {" "}vs last month
              </small>

            </div>

          </div>

          {/* SAVINGS */}

          <div className="analytics-stat-card">

            <div className="stat-icon savings">
              <Wallet size={25} />
            </div>

            <div className="stat-content">

              <span>
                Savings Rate
              </span>

              <strong>
                {savingsRate}%
              </strong>

              <small className="positive">
                <ArrowUpRight size={13} />
                <b>
                  {formatMoney(
                    summary.savings
                  )}
                </b>{" "}
                saved
              </small>

            </div>

          </div>

          {/* TOP CATEGORY */}

          <div className="analytics-stat-card">

            <div className="stat-icon category">
              <TrendingUp size={25} />
            </div>

            <div className="stat-content">

              <span>
                Top Category
              </span>

              <strong className="category-name">
                {topCategory.category ||
                  "No Data"}
              </strong>

              <small>
                {formatMoney(
                  topCategory.amount
                )}{" "}
                (
                {topCategory.percentage ||
                  0}
                % of total)
              </small>

            </div>

          </div>

        </section>

        <section className="analytics-chart-grid">

          {/* INCOME VS EXPENSE */}

          <div className="analytics-panel large-chart">

            <div className="analytics-panel-header">

              <div>
                <h2>
                  Income vs Expenses
                </h2>

                <p>
                  Your financial flow
                  over time
                </p>
              </div>

              <div className="chart-header-right">

                <div className="chart-legend">

                  <span>
                    <i className="income-dot"></i>
                    Income
                  </span>

                  <span>
                    <i className="expense-dot"></i>
                    Expenses
                  </span>

                </div>

                <select
                  className="small-select"
                  value={chartPeriod}
                  onChange={(e) =>
                    setChartPeriod(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Last 3 Months
                  </option>

                  <option>
                    Last 6 Months
                  </option>

                  <option>
                    Last 12 Months
                  </option>
                </select>

              </div>

            </div>

            <div className="bar-chart">

              <div className="bar-y-axis">
                <span>{formatAxisValue(maxTrendValue)}</span>
                <span>{formatAxisValue(maxTrendValue * 0.75)}</span>
                <span>{formatAxisValue(maxTrendValue * 0.5)}</span>
                <span>{formatAxisValue(maxTrendValue * 0.25)}</span>
                <span>0</span>
              </div>

              <div className="bars-area">

                <div className="chart-grid-line line-1"></div>
                <div className="chart-grid-line line-2"></div>
                <div className="chart-grid-line line-3"></div>
                <div className="chart-grid-line line-4"></div>

                {displayedMonthlyTrend.map(
                  (item) => {
                    const incomeHeight = (item.income / maxTrendValue) * 190;
                    const expenseHeight = (item.expenses / maxTrendValue) * 190;

                    return (
                      <div
                        className="bar-group"
                        key={item.month}
                      >

                        <div className="bar-pair">

                          <div
                            className="income-bar"
                            style={{
                              height: `${incomeHeight}px`,
                            }}
                          ></div>

                          <div
                            className="expense-bar"
                            style={{
                              height: `${expenseHeight}px`,
                            }}
                          ></div>

                        </div>

                        <span>
                          {formatMonthLabel(
                            item.month
                          ).slice(0, 3)}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

          {/* EXPENSE BREAKDOWN */}

          <div className="analytics-panel breakdown-panel">

            <div className="analytics-panel-header">

              <div>
                <h2>
                  Expense Breakdown
                </h2>

                <p>
                  Where your money goes
                </p>
              </div>

              <select
                className="small-select"
                value={breakdownPeriod}
                onChange={(e) =>
                  setBreakdownPeriod(
                    e.target.value
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
                  Last 3 Months
                </option>
              </select>

            </div>

            <div className="donut-content">

              <div
                className="donut-chart"
                style={{
                  background:
                    donutBackground,
                }}
              >

                <div className="donut-hole">

                  <strong>
                    {formatMoney(categoryTotal)}
                  </strong>

                  <span>
                    Total Expenses
                  </span>

                </div>

              </div>

              <div className="donut-legend">

                {breakdownCategories.map(
                  (category) => (
                    <div
                      className="donut-legend-row"
                      key={
                        category.category
                      }
                    >

                      <div>
                        <i
                          className={`legend-dot ${category.className}`}
                        ></i>

                        <span>
                          {
                            category.category
                          }
                        </span>
                      </div>

                      <span>
                        {Math.round(
                          category.percentage ||
                            0
                        )}
                        %
                      </span>

                      <strong>
                        {formatMoney(
                          category.amount
                        )}
                      </strong>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </section>


        <section className="analytics-second-grid">

          {/* CATEGORY SPENDING */}

          <div className="analytics-panel category-spending-panel">

            <div className="analytics-panel-header">

              <div>
                <h2>
                  Category Spending
                </h2>

                <p>
                  Detailed breakdown
                  by category
                </p>
              </div>

              <select
                className="small-select"
                value={categoryPeriod}
                onChange={(e) =>
                  setCategoryPeriod(
                    e.target.value
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
                  Last 3 Months
                </option>
              </select>

            </div>

            <div className="category-spending-list">

              {spendingCategories.length === 0 ? (
                <div className="analytics-empty">
                  No expense data for
                  this month.
                </div>
              ) : (
                spendingCategories.map(
                  (category) => {
                    const Icon =
                      category.icon;

                    return (
                      <div
                        className="category-spending-row"
                        key={
                          category.category
                        }
                        onClick={() =>
                          setSelectedCategory(
                            category.category
                          )
                        }
                      >

                        <div className="category-name-wrap">

                          <div
                            className={`category-small-icon ${category.className}`}
                          >
                            <Icon size={16} />
                          </div>

                          <span>
                            {
                              category.category
                            }
                          </span>

                        </div>

                        <div className="category-progress-wrap">

                          <div className="category-progress-bg">

                            <div
                              className={`category-progress-fill ${category.className}`}
                              style={{
                                width: `${Math.min(
                                  category.percentage ||
                                    0,
                                  100
                                )}%`,
                              }}
                            ></div>

                          </div>

                        </div>

                        <span className="category-percent">
                          {Math.round(
                            category.percentage ||
                              0
                          )}
                          %
                        </span>

                        <strong className="category-amount">
                          {formatMoney(
                            category.amount
                          )}
                        </strong>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>

          {/* MONTHLY TREND */}

          <div className="analytics-panel trend-category-panel">

            <div className="analytics-panel-header">

              <div>
                <h2>
                  Monthly Trend by Category
                </h2>

                <p>
                  How your spending
                  changes over time
                </p>
              </div>

              <select
                className="small-select"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
              >

                {[...new Set([
                  ...Object.keys(categoryIcons),
                  ...categories.map((item) => item.category),
                ])].map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="trend-chart">

              <div className="trend-y-axis">
                <span>8K</span>
                <span>6K</span>
                <span>4K</span>
                <span>2K</span>
                <span>0</span>
              </div>

              <div className="trend-area">

                <div className="trend-grid-line t1"></div>
                <div className="trend-grid-line t2"></div>
                <div className="trend-grid-line t3"></div>
                <div className="trend-grid-line t4"></div>

                <svg
                  viewBox="0 0 700 240"
                  preserveAspectRatio="none"
                  className="trend-svg"
                >

                  <defs>

                    <linearGradient
                      id="trendFillDynamic"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#ff3151"
                        stopOpacity="0.35"
                      />

                      <stop
                        offset="100%"
                        stopColor="#ff3151"
                        stopOpacity="0.03"
                      />

                    </linearGradient>

                  </defs>

                  {categoryTrendData.length >
                    0 && (
                    <>
                      <polyline
                        points={categoryTrendData
                          .map(
                            (item, index) => {
                              const x =
                                categoryTrendData.length ===
                                1
                                  ? 0
                                  : (index /
                                      (categoryTrendData.length -
                                        1)) *
                                    700;

                              const y =
                                220 -
                                (item.amount /
                                  categoryTrendMax) *
                                  180;

                              return `${x},${y}`;
                            }
                          )
                          .join(" ")}
                        fill="none"
                        stroke="#ff3151"
                        strokeWidth="4"
                      />
                    </>
                  )}

                </svg>

                <div className="trend-tooltip">

                  <strong>
                    {formatMoney(
                      categoryTrendData[
                        categoryTrendData.length -
                          1
                      ]?.amount || 0
                    )}
                  </strong>

                  <span>
                    {formatMonthLabel(
                      categoryTrendData[
                        categoryTrendData.length -
                          1
                      ]?.month ||
                        selectedMonth
                    )}
                  </span>

                </div>

              </div>

            </div>

            <div className="trend-months">

              {categoryTrendData.map(
                (item) => (
                  <span
                    key={item.month}
                  >
                    {formatMonthLabel(
                      item.month
                    ).slice(0, 3)}
                  </span>
                )
              )}

            </div>

          </div>

        </section>

        <section className="analytics-bottom-grid">


          <div className="analytics-panel merchants-panel">

            <div className="analytics-panel-header">

              <div>
                <h2>
                  Top Merchants
                </h2>

                <p>
                  Where you spend the most
                </p>
              </div>

              <select
                className="small-select"
                value={merchantPeriod}
                onChange={(e) =>
                  setMerchantPeriod(
                    e.target.value
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
                  Last 3 Months
                </option>
              </select>

            </div>

            <div className="merchant-list">

              {merchants.length === 0 ? (
                <div className="analytics-empty">
                  No recent expense
                  transactions found.
                </div>
              ) : (
                merchants.map(
                  (merchant) => {
                    const width =
                      (merchant.amount /
                        maxMerchantAmount) *
                      100;

                    return (
                      <div
                        className="merchant-row"
                        key={
                          merchant.name
                        }
                      >

                        <div className="merchant-logo">
                          {merchant.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="merchant-name">
                          <strong>
                            {
                              merchant.name
                            }
                          </strong>
                        </div>

                        <div className="merchant-bar">

                          <div
                            style={{
                              width: `${width}%`,
                            }}
                          ></div>

                        </div>

                        <div className="merchant-info">

                          <strong>
                            {formatMoney(
                              merchant.amount
                            )}
                          </strong>

                          <span>
                            {
                              merchant.transactions
                            }{" "}
                            transactions
                          </span>

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>

          {/* INSIGHTS */}

          <div className="analytics-panel insights-panel">

            <div className="insights-title">

              <Lightbulb size={20} />

              <h2>
                Spending Insights
              </h2>

            </div>

            <div className="insight-row">

              <div className="insight-round green">
                <ArrowUpRight size={16} />
              </div>

              <p>
                Your{" "}
                <strong>
                  {(
                    topCategory.category ||
                    "expense"
                  ).toLowerCase()}
                </strong>{" "}
                is currently your
                highest spending
                category.
              </p>

            </div>

            <div className="insight-row">

              <div className="insight-round green">
                <ArrowUpRight size={16} />
              </div>

              <p>
                You saved{" "}
                <strong>
                  {formatMoney(
                    summary.savings
                  )}
                </strong>{" "}
                this month.
              </p>

            </div>

            <div className="insight-row">

              <div className="insight-round blue">
                <BarChart3 size={16} />
              </div>

              <p>
                Your budget usage is{" "}
                <strong>
                  {Math.round(
                    summary.budgetUsage ||
                      0
                  )}
                  %
                </strong>
                .
              </p>

            </div>

            <div className="insight-row">

              <div className="insight-round blue">
                <Wallet size={16} />
              </div>

              <p>
                Total monthly budget:
                {" "}
                <strong>
                  {formatMoney(
                    summary.totalBudget
                  )}
                </strong>
              </p>

            </div>

          </div>

          {/* RECENT TRENDS */}

          <div className="analytics-panel recent-trends-panel">

            <div className="insights-title">

              <BarChart3 size={20} />

              <h2>
                Recent Category Trends
              </h2>

            </div>

            {categories
              .slice(0, 3)
              .map((category) => {

                const previousCategory =
                  previousData?.categories?.find(
                    (item) =>
                      item.category ===
                      category.category
                  );

                const previousAmount =
                  previousCategory?.amount ||
                  0;

                let change = 0;

                if (
                  previousAmount > 0
                ) {
                  change = Math.round(
                    ((category.amount -
                      previousAmount) /
                      previousAmount) *
                      100
                  );
                }

                return (
                  <div
                    className="recent-trend-row"
                    key={
                      category.category
                    }
                  >

                    <span>
                      {
                        category.category
                      }
                    </span>

                    <strong
                      className={
                        change <= 0
                          ? "trend-down"
                          : "trend-up"
                      }
                    >
                      {change <= 0
                        ? "↓"
                        : "↑"}{" "}
                      {Math.abs(change)}%
                    </strong>

                    <small>
                      {change <= 0
                        ? "Lower than last month"
                        : "Higher than last month"}
                    </small>

                  </div>
                );
              })}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Analytics;