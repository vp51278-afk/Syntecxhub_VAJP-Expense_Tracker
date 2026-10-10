import { useState } from "react";
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
  X,
} from "lucide-react";

import { Link } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30 Days");
  const [selectedMonth, setSelectedMonth] = useState("September 2026");

  const transactions = [
    {
      icon: <Utensils size={19} />,
      iconClass: "food",
      title: "Grocery Shopping",
      category: "Food",
      date: "14 Sep 2026",
      amount: "-₹1,850",
    },
    {
      icon: <TrainFront size={19} />,
      iconClass: "transport",
      title: "Metro Recharge",
      category: "Transport",
      date: "12 Sep 2026",
      amount: "-₹500",
    },
    {
      icon: <Utensils size={19} />,
      iconClass: "food",
      title: "Dinner",
      category: "Food",
      date: "10 Sep 2026",
      amount: "-₹650",
    },
    {
      icon: <CircleDollarSign size={19} />,
      iconClass: "income",
      title: "Freelance Payment",
      category: "Income",
      date: "8 Sep 2026",
      amount: "+₹5,000",
    },
    {
      icon: <ShoppingBag size={19} />,
      iconClass: "shopping",
      title: "Amazon Order",
      category: "Shopping",
      date: "6 Sep 2026",
      amount: "-₹2,300",
    },
  ];

  const goals = [
    {
      title: "Laptop",
      saved: "₹34,000",
      target: "₹50,000",
      percentage: 68,
      icon: <Laptop size={21} />,
      type: "laptop",
    },
    {
      title: "Emergency Fund",
      saved: "₹9,000",
      target: "₹20,000",
      percentage: 45,
      icon: <PiggyBank size={21} />,
      type: "emergency",
    },
    {
      title: "Trip to Goa",
      saved: "₹15,000",
      target: "₹50,000",
      percentage: 30,
      icon: <Plane size={21} />,
      type: "trip",
    },
  ];

  return (
    <div className="new-dashboard">


      <aside className="new-dashboard-sidebar">

        <Link to="/" className="new-dashboard-logo">
          <div className="new-logo-box">E</div>

          <span>
            Expense<span>Flow</span>
          </span>
        </Link>

        <nav className="new-dashboard-nav">

          <Link
            to="/dashboard"
            className="new-nav-item active"
          >
            <Home size={21} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/transactions"
            className="new-nav-item"
          >
            <CreditCard size={21} />
            <span>Transactions</span>
          </Link>

          <Link
            to="/analytics"
            className="new-nav-item"
          >
            <BarChart3 size={21} />
            <span>Analytics</span>
          </Link>

          <Link
  to="/budgets"
  className="new-nav-item"
>
  <Wallet size={21} />
  <span>Budgets</span>
</Link>

          <Link
            to="/goals"
            className="new-nav-item"
          >
            <Target size={21} />
            <span>Goals</span>
          </Link>

          <Link
            to="/simulator"
            className="new-nav-item"
          >
            <ShoppingCart size={21} />
            <span>Before You Buy</span>
          </Link>

          <Link
            to="/profile"
            className="new-nav-item"
          >
            <User size={21} />
            <span>Profile</span>
          </Link>

        </nav>

        {/* UPGRADE CARD */}

        <div className="upgrade-card">

          <div className="upgrade-icon">
            <Crown size={20} />
          </div>

          <h3>Upgrade to Pro</h3>

          <p>
            Get advanced insights and smart
            recommendations.
          </p>

          <button>
            Upgrade Now
            <ArrowRight size={16} />
          </button>

        </div>

      </aside>


      <main className="new-dashboard-main">

        {/* HEADER */}

        <header className="new-dashboard-header">

          <div className="dashboard-welcome">

            <h1>
              Hello, Vaishnavi 👋
            </h1>

            <p>
              Here's your financial overview.
            </p>

          </div>


          <div className="dashboard-header-actions">

            {/* MONTH */}

            <button
              className="dashboard-month-button"
              onClick={() =>
                setSelectedMonth(
                  selectedMonth === "September 2026"
                    ? "October 2026"
                    : "September 2026"
                )
              }
            >
              <CalendarDays size={18} />

              <span>
                {selectedMonth}
              </span>

              <ChevronDown size={16} />
            </button>


            {/* NOTIFICATION */}

            <div className="notification-wrapper">

              <button
                className="notification-button"
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
              >

                <Bell size={21} />

                <span className="notification-count">
                  3
                </span>

              </button>


              {showNotifications && (

                <div className="notification-dropdown">

                  <div className="notification-header">

                    <strong>
                      Notifications
                    </strong>

                    <button>
                      View all
                    </button>

                  </div>


                  <Notification
                    icon={<ArrowUpRight size={18} />}
                    type="red"
                    text="Your Food spending increased by 18% this month."
                    time="2h ago"
                  />

                  <Notification
                    icon={<Target size={18} />}
                    type="green"
                    text="You are 68% closer to your Laptop goal."
                    time="5h ago"
                  />

                  <Notification
                    icon={<AlertTriangle size={18} />}
                    type="yellow"
                    text="Your monthly budget is 84% used."
                    time="1d ago"
                  />

                </div>

              )}

            </div>


            {/* PROFILE */}

            <button className="dashboard-profile-button">

              <div className="dashboard-avatar">
                V
              </div>

              <ChevronDown size={16} />

            </button>

          </div>

        </header>



        <section className="new-stat-grid">

          <StatCard
            type="balance"
            icon={<Wallet size={22} />}
            title="Total Balance"
            value="₹42,500"
            change="12%"
            positive
          />

          <StatCard
            type="income"
            icon={<ArrowUpRight size={22} />}
            title="Monthly Income"
            value="₹60,000"
            change="8%"
            positive
          />

          <StatCard
            type="expense"
            icon={<ArrowDownRight size={22} />}
            title="Monthly Expenses"
            value="₹17,500"
            change="5%"
          />

          <StatCard
            type="safe"
            icon={<CircleDollarSign size={22} />}
            title="Safe to Spend"
            value="₹7,200"
            customText="Based on your goals"
          />

        </section>


        <section className="dashboard-chart-grid">


          {/* SPENDING TREND */}

          <div className="dashboard-box spending-box">

            <div className="dashboard-box-header">

              <div>
                <h2>
                  Spending Trend
                </h2>

                <p>
                  Income vs expenses
                </p>
              </div>


              <div className="period-buttons">

                {[
                  "7 Days",
                  "30 Days",
                  "6 Months",
                  "1 Year",
                ].map((period) => (

                  <button
                    key={period}
                    className={
                      selectedPeriod === period
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedPeriod(period)
                    }
                  >
                    {period}
                  </button>

                ))}

              </div>

            </div>


            <div className="chart-legend-new">

              <span>
                <i className="legend-dot income-dot"></i>
                Income
              </span>

              <span>
                <i className="legend-dot expense-dot"></i>
                Expenses
              </span>

            </div>


            <div className="line-chart-wrapper">

              <div className="chart-y-labels">

                <span>20K</span>
                <span>15K</span>
                <span>10K</span>
                <span>5K</span>
                <span>0</span>

              </div>


              <svg
                className="line-chart"
                viewBox="0 0 760 250"
                preserveAspectRatio="none"
              >

                {/* GRID */}

                <line
                  x1="0"
                  y1="25"
                  x2="760"
                  y2="25"
                  className="chart-grid-line"
                />

                <line
                  x1="0"
                  y1="80"
                  x2="760"
                  y2="80"
                  className="chart-grid-line"
                />

                <line
                  x1="0"
                  y1="135"
                  x2="760"
                  y2="135"
                  className="chart-grid-line"
                />

                <line
                  x1="0"
                  y1="190"
                  x2="760"
                  y2="190"
                  className="chart-grid-line"
                />

                <line
                  x1="0"
                  y1="240"
                  x2="760"
                  y2="240"
                  className="chart-grid-line"
                />


                {/* INCOME AREA */}

                <path
                  d="
                    M0 190
                    C50 165 70 170 105 145
                    S165 125 200 145
                    S260 115 300 100
                    S350 120 390 135
                    S450 95 500 105
                    S560 70 600 90
                    S660 45 700 58
                    S735 35 760 48
                    L760 240
                    L0 240
                    Z
                  "
                  className="income-area"
                />


                {/* EXPENSE AREA */}

                <path
                  d="
                    M0 215
                    C45 200 75 185 105 178
                    S165 155 200 175
                    S260 160 300 150
                    S350 165 390 175
                    S450 135 500 150
                    S560 130 600 145
                    S660 110 700 120
                    S735 105 760 112
                    L760 240
                    L0 240
                    Z
                  "
                  className="expense-area"
                />


                {/* INCOME LINE */}

                <path
                  d="
                    M0 190
                    C50 165 70 170 105 145
                    S165 125 200 145
                    S260 115 300 100
                    S350 120 390 135
                    S450 95 500 105
                    S560 70 600 90
                    S660 45 700 58
                    S735 35 760 48
                  "
                  className="income-line"
                />


                {/* EXPENSE LINE */}

                <path
                  d="
                    M0 215
                    C45 200 75 185 105 178
                    S165 155 200 175
                    S260 160 300 150
                    S350 165 390 175
                    S450 135 500 150
                    S560 130 600 145
                    S660 110 700 120
                    S735 105 760 112
                  "
                  className="expense-line"
                />


                {/* POINT */}

                <circle
                  cx="390"
                  cy="135"
                  r="6"
                  className="chart-point-income"
                />

                <circle
                  cx="390"
                  cy="175"
                  r="6"
                  className="chart-point-expense"
                />

              </svg>


              <div className="chart-x-labels">

                <span>1 Sep</span>
                <span>5 Sep</span>
                <span>10 Sep</span>
                <span>15 Sep</span>
                <span>20 Sep</span>
                <span>25 Sep</span>
                <span>30 Sep</span>

              </div>

            </div>

          </div>


          {/* CATEGORY */}

          <div className="dashboard-box category-box">

            <div className="dashboard-box-header">

              <div>

                <h2>
                  Spending by Category
                </h2>

                <p>
                  Where your money goes
                </p>

              </div>

              <button className="category-month">
                This Month
                <ChevronDown size={15} />
              </button>

            </div>


            <div className="category-content">

              <div className="donut-wrapper">

                <div className="donut-chart">

                  <div className="donut-center">

                    <strong>
                      ₹17,500
                    </strong>

                    <span>
                      Total Spent
                    </span>

                  </div>

                </div>

              </div>


              <div className="category-list">

                <CategoryItem
                  name="Food"
                  percentage="30%"
                  amount="₹5,250"
                  type="food"
                />

                <CategoryItem
                  name="Transport"
                  percentage="20%"
                  amount="₹3,500"
                  type="transport"
                />

                <CategoryItem
                  name="Shopping"
                  percentage="15%"
                  amount="₹2,625"
                  type="shopping"
                />

                <CategoryItem
                  name="Bills"
                  percentage="15%"
                  amount="₹2,625"
                  type="bills"
                />

                <CategoryItem
                  name="Entertainment"
                  percentage="10%"
                  amount="₹1,750"
                  type="entertainment"
                />

                <CategoryItem
                  name="Others"
                  percentage="10%"
                  amount="₹1,750"
                  type="others"
                />

              </div>

            </div>

          </div>

        </section>


        {/* ================= BOTTOM GRID ================= */}

        <section className="dashboard-bottom-grid-new">


          {/* TRANSACTIONS */}

          <div className="dashboard-box transactions-box-new">

            <div className="dashboard-box-header">

              <div>
                <h2>
                  Recent Transactions
                </h2>
              </div>

              <Link to="/transactions">
                View all <ArrowRight size={15} />
              </Link>

            </div>


            <div className="transaction-list">

              {transactions.map((transaction) => (

                <div
                  className="new-transaction-row"
                  key={transaction.title}
                >

                  <div
                    className={`transaction-new-icon ${transaction.iconClass}`}
                  >
                    {transaction.icon}
                  </div>


                  <div className="transaction-new-info">

                    <strong>
                      {transaction.title}
                    </strong>

                    <span>
                      {transaction.category}
                    </span>

                  </div>


                  <span className="transaction-new-date">
                    {transaction.date}
                  </span>


                  <strong
                    className={
                      transaction.amount.startsWith("+")
                        ? "transaction-income"
                        : "transaction-expense"
                    }
                  >
                    {transaction.amount}
                  </strong>


                  <ArrowRight
                    size={17}
                    className="transaction-arrow"
                  />

                </div>

              ))}

            </div>

          </div>


          {/* FINANCIAL HEALTH */}

          <div className="dashboard-box health-box">

            <div className="dashboard-box-header">

              <div>
                <h2>
                  Financial Health
                </h2>
              </div>

            </div>


            <div className="health-content">

              <div className="health-circle">

                <svg viewBox="0 0 120 120">

                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="health-bg"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="health-progress"
                  />

                </svg>


                <div className="health-number">
                  <strong>78</strong>
                  <span>/100</span>
                </div>

              </div>


              <div className="health-message">

                <strong>
                  You're doing well!
                </strong>

                <HealthPoint
                  icon={<CheckCircle2 size={15} />}
                  text="Spending within budget"
                  good
                />

                <HealthPoint
                  icon={<CheckCircle2 size={15} />}
                  text="Good savings rate"
                  good
                />

                <HealthPoint
                  icon={<AlertTriangle size={15} />}
                  text="Food spending increased"
                />

                <HealthPoint
                  icon={<AlertTriangle size={15} />}
                  text="Laptop goal needs attention"
                />

              </div>

            </div>


            <Link
              to="/analytics"
              className="health-button"
            >
              View Analysis
              <ArrowRight size={16} />
            </Link>

          </div>


          {/* GOALS */}

          <div className="dashboard-box goals-progress-box">

            <div className="dashboard-box-header">

              <h2>
                Goals Progress
              </h2>

              <Link to="/goals">
                View all <ArrowRight size={15} />
              </Link>

            </div>


            <div className="dashboard-goals-list">

              {goals.map((goal) => (

                <div
                  className="dashboard-goal-row"
                  key={goal.title}
                >

                  <div
                    className={`dashboard-goal-icon ${goal.type}`}
                  >
                    {goal.icon}
                  </div>


                  <div className="dashboard-goal-main">

                    <div className="dashboard-goal-title">

                      <strong>
                        {goal.title}
                      </strong>

                      <span>
                        {goal.percentage}%
                      </span>

                    </div>


                    <div className="dashboard-goal-progress">

                      <div
                        className={goal.type}
                        style={{
                          width: `${goal.percentage}%`,
                        }}
                      ></div>

                    </div>


                    <small>
                      {goal.saved} / {goal.target}
                    </small>

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* MONEY INSIGHTS */}

          <div className="dashboard-box insights-box">

            <div className="insights-heading">

              <div className="insights-title">

                <Lightbulb size={19} />

                <h2>
                  Money Insights
                </h2>

              </div>

              <button>
                View all <ArrowRight size={14} />
              </button>

            </div>


            <div className="insights-grid">

              <Insight
                icon={<ArrowUpRight size={19} />}
                type="red"
                text="You spent 18% more on Food this month."
              />

              <Insight
                icon={<ArrowDownRight size={19} />}
                type="green"
                text="Shopping expenses decreased by 14%."
              />

              <Insight
                icon={<Info size={19} />}
                type="blue"
                text="You have ₹7,200 available for discretionary spending."
              />

            </div>

          </div>


          {/* BEFORE YOU BUY */}

          <div className="dashboard-box before-buy-new">

            <div className="before-buy-new-icon">
              <ShoppingCart size={22} />
            </div>


            <div className="before-buy-new-content">

              <h2>
                Before You Buy
              </h2>

              <p>
                Thinking about a purchase?
                <br />
                See how it affects your goals and budget.
              </p>

            </div>


            <Link
              to="/simulator"
              className="before-buy-new-button"
            >
              Simulate Purchase
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>

      </main>


      {showNotifications && (
        <button
          className="notification-overlay"
          onClick={() => setShowNotifications(false)}
          aria-label="Close notifications"
        >
          <X size={1} />
        </button>
      )}

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

      <div className="stat-card-icon">
        {icon}
      </div>


      <div className="stat-card-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>


        {customText ? (

          <small>
            {customText}
          </small>

        ) : (

          <small
            className={
              positive
                ? "stat-positive-new"
                : "stat-negative-new"
            }
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}

            {change}{" "}
            <span>vs last month</span>
          </small>

        )}

      </div>


      <ArrowRight
        size={18}
        className="stat-arrow"
      />

    </div>
  );
}


function Notification({
  icon,
  type,
  text,
  time,
}) {
  return (
    <div className="notification-item">

      <div className={`notification-icon ${type}`}>
        {icon}
      </div>

      <div className="notification-text">

        <p>
          {text}
        </p>

        <span>
          {time}
        </span>

      </div>

    </div>
  );
}

function CategoryItem({
  name,
  percentage,
  amount,
  type,
}) {
  return (
    <div className="category-item">

      <div className={`category-dot ${type}`}></div>

      <span>
        {name}
      </span>

      <strong>
        {percentage}
      </strong>

      <small>
        {amount}
      </small>

    </div>
  );
}

function HealthPoint({
  icon,
  text,
  good,
}) {
  return (
    <div
      className={`health-point ${
        good ? "good" : "warning"
      }`}
    >
      {icon}
      <span>
        {text}
      </span>
    </div>
  );
}



function Insight({
  icon,
  type,
  text,
}) {
  return (
    <div className="insight-card">

      <div className={`insight-icon ${type}`}>
        {icon}
      </div>

      <p>
        {text}
      </p>

    </div>
  );
}


export default Dashboard;