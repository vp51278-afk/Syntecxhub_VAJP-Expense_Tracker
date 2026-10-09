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
  CircleHelp,
  TrendingUp,
  BriefcaseBusiness,
  Calculator,
  Scale,
  Lightbulb,
  AlertTriangle,
  ExternalLink,
  Monitor,
  Bell,
  X,
  CheckCircle2,
  RotateCcw,
  Bot,
  Sparkles,
  ArrowRight,
  Brain,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Simulator.css";

function Simulator() {
  const navigate = useNavigate();

  const [itemName, setItemName] = useState("iPhone 15");
  const [price, setPrice] = useState(79900);
  const [category, setCategory] = useState("Electronics");
  const [purchaseType, setPurchaseType] = useState("One-time");
  const [purchaseDate, setPurchaseDate] = useState("2026-10-15");

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [hasSimulated, setHasSimulated] = useState(false);
  const [error, setError] = useState("");



  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);


  const income = 60000;
  const currentExpenses = 17500;

  const remainingBudget = income - currentExpenses;

  const purchasePrice = Number(price || 0);

  const newExpenses = currentExpenses + purchasePrice;

  const newRemaining = income - newExpenses;

  const savingsRate =
    income > 0
      ? Math.round((newRemaining / income) * 100)
      : 0;

  const remainingPercentage =
    income > 0
      ? Math.max(
          0,
          Math.round((remainingBudget / income) * 100)
        )
      : 0;



  const safeToSpend = Math.max(0, remainingBudget);

  const isRecommended =
    purchasePrice > 0 &&
    purchasePrice <= remainingBudget;

  const formattedDate = purchaseDate
    ? new Date(`${purchaseDate}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Select date";


  const handleSimulate = () => {
    setError("");
    setAiError("");
    setAiResult(null);

    if (!itemName.trim()) {
      setError("Please enter the item name.");
      return;
    }

    if (!purchasePrice || purchasePrice <= 0) {
      setError("Please enter a valid purchase price.");
      return;
    }

    if (!purchaseDate) {
      setError("Please select a purchase date.");
      return;
    }

    setHasSimulated(true);

    setTimeout(() => {
      document
        .querySelector(".impact-panel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  };


  const askVajpExpense = async () => {
    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
      const advisorData = {
        monthlyIncome: income,
        currentExpenses,
        balance: remainingBudget,
        safeToSpend,

        itemName,
        price: purchasePrice,
        category,
        purchaseType,

        reason: "Want",

        goals: [],
      };

      // Save context so Vajp Expense can use it later
      localStorage.setItem(
        "vajpExpenseContext",
        JSON.stringify(advisorData)
      );

      const response = await fetch(
        "http://localhost:5000/api/advisor",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(advisorData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to get AI recommendation."
        );
      }

      if (!result.success || !result.data) {
        throw new Error(
          "Invalid response received from Vajp Expense."
        );
      }

      setAiResult(result.data);

      setTimeout(() => {
        document
          .querySelector(".vajp-expense-panel")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 100);
    } catch (error) {
      console.error("Vajp Expense Error:", error);

      setAiError(
        error.message ||
          "Vajp Expense could not analyze this purchase."
      );
    } finally {
      setAiLoading(false);
    }
  };


  const openVajpExpense = () => {
    const context = {
      monthlyIncome: income,
      currentExpenses,
      balance: remainingBudget,
      safeToSpend,

      itemName,
      price: purchasePrice,
      category,
      purchaseType,

      reason: "Want",
      goals: [],
    };

    localStorage.setItem(
      "vajpExpenseContext",
      JSON.stringify(context)
    );

    
    navigate("/");
  };


  const handleReset = () => {
    setItemName("iPhone 15");
    setPrice(79900);
    setCategory("Electronics");
    setPurchaseType("One-time");
    setPurchaseDate("2026-10-15");

    setHasSimulated(false);
    setError("");

    setAiLoading(false);
    setAiError("");
    setAiResult(null);

    localStorage.removeItem("vajpExpenseContext");
  };


  const handleAlternative = (
    name,
    alternativePrice,
    alternativeCategory = "Electronics"
  ) => {
    setItemName(name);
    setPrice(alternativePrice);
    setCategory(alternativeCategory);

    setHasSimulated(false);

    setAiError("");
    setAiResult(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const openAmazon = () => {
    const searchTerm = encodeURIComponent(
      `${itemName} ${category}`
    );

    window.open(
      `https://www.amazon.in/s?k=${searchTerm}`,
      "_blank",
      "noopener,noreferrer"
    );
  };


  const getDecisionClass = () => {
    if (!aiResult) return "";

    if (aiResult.decision === "BUY") {
      return "buy";
    }

    if (aiResult.decision === "WAIT") {
      return "wait";
    }

    return "avoid";
  };

  const getDecisionIcon = () => {
    if (!aiResult) return null;

    if (aiResult.decision === "BUY") {
      return <CheckCircle2 size={27} />;
    }

    if (aiResult.decision === "WAIT") {
      return <AlertTriangle size={27} />;
    }

    return <AlertTriangle size={27} />;
  };

  return (
    <div className="buy-page">


      <aside className="buy-sidebar">

        <Link to="/" className="buy-logo">
          <div className="buy-logo-box">
            E
          </div>

          <span>
            Expense<span>Flow</span>
          </span>
        </Link>

        <nav className="buy-nav">

          <Link
            to="/dashboard"
            className="buy-nav-item"
          >
            <Home size={21} />
            Dashboard
          </Link>

          <Link
            to="/transactions"
            className="buy-nav-item"
          >
            <CreditCard size={21} />
            Transactions
          </Link>

          <Link
            to="/analytics"
            className="buy-nav-item"
          >
            <BarChart3 size={21} />
            Analytics
          </Link>

          <Link
            to="/budgets"
            className="buy-nav-item"
          >
            <Wallet size={21} />
            Budgets
          </Link>

          <Link
            to="/goals"
            className="buy-nav-item"
          >
            <Target size={21} />
            Goals
          </Link>

          <Link
            to="/simulator"
            className="buy-nav-item active"
          >
            <ShoppingCart size={21} />
            Before You Buy
          </Link>

          <Link
            to="/profile"
            className="buy-nav-item"
          >
            <User size={21} />
            Profile
          </Link>

        </nav>

        <div className="buy-smart-tip">
          <Lightbulb size={25} />

          <strong>
            Smart Tip
          </strong>

          <p>
            Think before you buy.
            A little planning today
            can save you a lot
            tomorrow!
          </p>
        </div>

      </aside>


      <main className="buy-main">

        {/* TOPBAR */}

        <header className="buy-topbar">

          <div></div>

          <div className="buy-top-actions">

            <button className="buy-date">
              <CalendarDays size={18} />
              October 2026
              <ChevronDown size={15} />
            </button>

            <div className="sim-notification-wrapper">

              <button
                className="buy-notification"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
              >
                <Bell size={19} />
                <i></i>
              </button>

              {showNotifications && (
                <div className="sim-notification-dropdown">

                  <div className="sim-notification-header">

                    <strong>
                      Notifications
                    </strong>

                    <button
                      onClick={() =>
                        setShowNotifications(false)
                      }
                    >
                      <X size={16} />
                    </button>

                  </div>

                  <div className="sim-notification-item">

                    <AlertTriangle size={18} />

                    <div>

                      <strong>
                        Purchase Check
                      </strong>

                      <p>
                        Review your purchase before
                        spending your money.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>

            <div className="buy-avatar">
              V
            </div>

          </div>

        </header>

        <section className="buy-heading">

          <div className="buy-heading-left">

            <ShoppingCart size={45} />

            <div>

              <h1>
                Before You Buy
              </h1>

              <p>
                Simulate your purchase and see its impact
                on your budget and goals.
              </p>

            </div>

          </div>

          <button
            className="how-button"
            onClick={() =>
              setShowHowItWorks(true)
            }
          >
            <CircleHelp size={20} />
            How it works?
            <span>›</span>
          </button>

        </section>

        <section className="buy-summary">

          <div className="buy-summary-card">

            <div className="buy-summary-icon green">
              <BriefcaseBusiness size={25} />
            </div>

            <div>

              <span>
                Your Monthly Income
              </span>

              <strong>
                ₹60,000
              </strong>

              <small className="green-text">
                ↗ &nbsp;8% vs last month
              </small>

            </div>

          </div>

          <div className="buy-summary-card">

            <div className="buy-summary-icon red">
              <BriefcaseBusiness size={25} />
            </div>

            <div>

              <span>
                Current Monthly Expenses
              </span>

              <strong>
                ₹17,500
              </strong>

              <small className="red-text">
                ↘ &nbsp;5% vs last month
              </small>

            </div>

          </div>

          <div className="buy-summary-card">

            <div className="buy-summary-icon blue">
              <TrendingUp size={25} />
            </div>

            <div className="remaining-summary">

              <span>
                Remaining Budget
              </span>

              <strong>
                ₹{remainingBudget.toLocaleString("en-IN")}
              </strong>

              <small>
                <b>
                  {remainingPercentage}%
                </b>{" "}
                of income
              </small>

              <div className="summary-progress">

                <div
                  style={{
                    width: `${remainingPercentage}%`,
                  }}
                ></div>

              </div>

            </div>

          </div>

        </section>


        <section className="buy-content-grid">


          <div className="buy-left-column">

            {/* SIMULATOR */}

            <div className="buy-panel simulator-panel">

              <div className="buy-panel-heading">

                <TrendingUp size={31} />

                <div>

                  <h2>
                    Purchase Simulator
                  </h2>

                  <p>
                    See how a potential purchase affects
                    your finances.
                  </p>

                </div>

              </div>

              <div className="simulator-layout">

                {/* FORM */}

                <div className="simulator-form">

                  <label>
                    Item Name
                  </label>

                  <input
                    value={itemName}
                    onChange={(e) =>
                      setItemName(e.target.value)
                    }
                    placeholder="Enter item name"
                  />

                  <div className="form-two-columns">

                    <div>

                      <label>
                        Category
                      </label>

                      <div className="select-wrap">

                        <Monitor size={17} />

                        <select
                          value={category}
                          onChange={(e) =>
                            setCategory(
                              e.target.value
                            )
                          }
                        >

                          <option value="Electronics">
                            Electronics
                          </option>

                          <option value="Food">
                            Food & Dining
                          </option>

                          <option value="Shopping">
                            Shopping
                          </option>

                          <option value="Transport">
                            Transport
                          </option>

                          <option value="Entertainment">
                            Entertainment
                          </option>

                          <option value="Bills">
                            Bills & Utilities
                          </option>

                          <option value="Travel">
                            Travel
                          </option>

                        </select>

                        <ChevronDown size={15} />

                      </div>

                    </div>

                    <div>

                      <label>
                        Price (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) =>
                          setPrice(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                  <label>
                    Purchase Type
                  </label>

                  <div className="purchase-toggle">

                    <button
                      type="button"
                      className={
                        purchaseType === "One-time"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setPurchaseType(
                          "One-time"
                        )
                      }
                    >
                      One-time
                    </button>

                    <button
                      type="button"
                      className={
                        purchaseType === "Recurring"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setPurchaseType(
                          "Recurring"
                        )
                      }
                    >
                      Recurring
                    </button>

                  </div>

                  <label>
                    Planned Purchase Date
                  </label>

                  <div className="date-input">

                    <CalendarDays size={18} />

                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) =>
                        setPurchaseDate(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  {error && (
                    <div className="sim-error">
                      <AlertTriangle size={17} />
                      {error}
                    </div>
                  )}

                </div>

                {/* PRODUCT PREVIEW */}

                <div className="product-preview">

                  <div className="product-image">

                    <div className="phone-placeholder">

                      <div className="phone-camera"></div>

                      <div className="phone-screen">
                        <span></span>
                      </div>

                    </div>

                  </div>

                  <h3>
                    {itemName || "Your Item"}
                  </h3>

                  <span>
                    {category}
                  </span>

                  <strong>
                    ₹
                    {Number(
                      price || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  <small
                    style={{
                      display: "block",
                      marginTop: "7px",
                      color: "#8b98a5",
                      fontSize: "11px",
                    }}
                  >
                    {purchaseType} · {formattedDate}
                  </small>

                  <button
                    type="button"
                    className="amazon-button"
                    onClick={openAmazon}
                  >
                    View on Amazon
                    <ExternalLink size={13} />
                  </button>

                </div>

              </div>

              {/* SIMULATE BUTTONS */}

              <div className="simulator-buttons">

                <button
                  type="button"
                  className="simulate-button"
                  onClick={handleSimulate}
                >
                  <Calculator size={19} />
                  Simulate Impact
                </button>

                <button
                  type="button"
                  className="reset-simulator-button"
                  onClick={handleReset}
                >
                  <RotateCcw size={17} />
                  Reset
                </button>

              </div>

              {hasSimulated && (
                <div
                  className={
                    isRecommended
                      ? "simulation-success"
                      : "simulation-warning"
                  }
                >

                  {isRecommended ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}

                  <div>

                    <strong>
                      Simulation Complete
                    </strong>

                    <p>
                      {isRecommended
                        ? "This purchase fits within your current available budget."
                        : "This purchase exceeds your available budget. Review the impact below."
                      }
                    </p>

                  </div>

                </div>
              )}

            </div>


            {hasSimulated && (
              <div className="buy-panel vajp-expense-panel">

                <div className="vajp-header">

                  <div className="vajp-icon">
                    <Bot size={27} />
                  </div>

                  <div>

                    <h2>
                      Vajp Expense
                    </h2>

                    <p>
                      Your personal AI money advisor
                    </p>

                  </div>

                  <Sparkles
                    size={22}
                    className="vajp-sparkle"
                  />

                </div>

                <div className="vajp-body">

                  <div className="vajp-message">

                    <Brain size={21} />

                    <div>

                      <strong>
                        Your impact is calculated.
                      </strong>

                      <p>
                        Now let Vajp Expense analyze
                        whether this purchase is a
                        good financial decision for you.
                      </p>

                    </div>

                  </div>

                  <div className="vajp-purchase-summary">

                    <div>
                      <span>
                        Purchase
                      </span>

                      <strong>
                        {itemName}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Amount
                      </span>

                      <strong>
                        ₹{purchasePrice.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Safe to spend
                      </span>

                      <strong>
                        ₹{safeToSpend.toLocaleString("en-IN")}
                      </strong>
                    </div>

                  </div>

                  <div className="vajp-actions">

                    <button
                      type="button"
                      className="vajp-ask-button"
                      onClick={askVajpExpense}
                      disabled={aiLoading}
                    >

                      {aiLoading ? (
                        <>
                          <span className="vajp-spinner"></span>
                          Vajp is thinking...
                        </>
                      ) : (
                        <>
                          <Bot size={19} />
                          Ask Vajp Expense
                          <ArrowRight size={18} />
                        </>
                      )}

                    </button>

                    <button
                      type="button"
                      className="vajp-open-button"
                      onClick={openVajpExpense}
                    >
                      Open Vajp Expense
                    </button>

                  </div>

                  {aiError && (
                    <div className="vajp-error">

                      <AlertTriangle size={18} />

                      <span>
                        {aiError}
                      </span>

                    </div>
                  )}

                </div>

              </div>
            )}


            {aiResult && (
              <div
                className={`buy-panel vajp-result-panel ${getDecisionClass()}`}
              >

                <div className="vajp-result-header">

                  <div className="vajp-result-brand">

                    <div className="vajp-small-icon">
                      <Bot size={22} />
                    </div>

                    <div>

                      <strong>
                        Vajp Expense
                      </strong>

                      <span>
                        AI Purchase Analysis
                      </span>

                    </div>

                  </div>

                  <Sparkles size={21} />

                </div>

                <div className="vajp-decision">

                  <div className="vajp-decision-icon">
                    {getDecisionIcon()}
                  </div>

                  <div>

                    <span>
                      Vajp recommends
                    </span>

                    <h2>
                      {aiResult.decision}
                    </h2>

                  </div>

                </div>

                <div className="vajp-result-grid">

                  <div className="vajp-result-card">

                    <span>
                      Recommended Spending
                    </span>

                    <strong>
                      ₹
                      {Number(
                        aiResult.recommendedAmount || 0
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>

                  <div className="vajp-result-card">

                    <span>
                      Purchase
                    </span>

                    <strong>
                      ₹
                      {purchasePrice.toLocaleString("en-IN")}
                    </strong>

                  </div>

                </div>

                <div className="vajp-advice-box">

                  <div>
                    <strong>
                      Why?
                    </strong>

                    <p>
                      {aiResult.reason}
                    </p>
                  </div>

                </div>

                <div className="vajp-advice-box">

                  <div>
                    <strong>
                      Goal Impact
                    </strong>

                    <p>
                      {aiResult.goalImpact}
                    </p>
                  </div>

                </div>

                <div className="vajp-advice-box">

                  <div>
                    <strong>
                      Better Alternative
                    </strong>

                    <p>
                      {aiResult.alternative}
                    </p>
                  </div>

                </div>

                <div className="vajp-action-box">

                  <Lightbulb size={20} />

                  <div>

                    <strong>
                      Vajp's Next Step
                    </strong>

                    <p>
                      {aiResult.action}
                    </p>

                  </div>

                </div>

              </div>
            )}

            <div className="buy-panel alternatives-panel">

              <div className="buy-panel-heading">

                <Scale size={31} />

                <div>

                  <h2>
                    Alternative Options
                  </h2>

                  <p>
                    Consider these alternatives to make
                    a smarter decision.
                  </p>

                </div>

              </div>

              <div className="alternative-grid">

                <Alternative
                  name="iPhone 14"
                  price="59,900"
                  saving="25%"
                  type="iphone"
                  onClick={() =>
                    handleAlternative(
                      "iPhone 14",
                      59900
                    )
                  }
                />

                <Alternative
                  name="Samsung S24"
                  price="74,999"
                  saving="6%"
                  type="samsung"
                  onClick={() =>
                    handleAlternative(
                      "Samsung S24",
                      74999
                    )
                  }
                />

                <Alternative
                  name="OnePlus 12"
                  price="64,999"
                  saving="19%"
                  type="oneplus"
                  onClick={() =>
                    handleAlternative(
                      "OnePlus 12",
                      64999
                    )
                  }
                />

              </div>

            </div>

          </div>

          <div className="buy-right-column">

            {/* IMPACT */}

            <div className="buy-panel impact-panel">

              <div className="buy-panel-heading">

                <TrendingUp size={31} />

                <div>

                  <h2>
                    Impact Analysis
                  </h2>

                  <p>
                    How this purchase affects your finances.
                  </p>

                </div>

              </div>

              <div className="impact-list">

                <ImpactRow
                  icon={
                    <BriefcaseBusiness size={19} />
                  }
                  color="red"
                  title="New Monthly Expenses"
                  value={`₹${newExpenses.toLocaleString(
                    "en-IN"
                  )}`}
                  change={
                    currentExpenses > 0
                      ? `+${Math.round(
                          (purchasePrice /
                            currentExpenses) *
                            100
                        )}%`
                      : ""
                  }
                />

                <ImpactRow
                  icon={
                    <Wallet size={19} />
                  }
                  color={
                    newRemaining < 0
                      ? "red"
                      : "green"
                  }
                  title="Remaining Budget"
                  value={
                    newRemaining < 0
                      ? `-₹${Math.abs(
                          newRemaining
                        ).toLocaleString("en-IN")}`
                      : `₹${newRemaining.toLocaleString(
                          "en-IN"
                        )}`
                  }
                  change={
                    newRemaining < 0
                      ? "Over Budget"
                      : "Available"
                  }
                />

                <ImpactRow
                  icon={
                    <TrendingUp size={19} />
                  }
                  color={
                    savingsRate < 0
                      ? "red"
                      : "blue"
                  }
                  title="Savings Rate"
                  value={`${Math.max(
                    savingsRate,
                    0
                  )}%`}
                  change={
                    savingsRate < 0
                      ? "Negative"
                      : "After Purchase"
                  }
                />

                <ImpactRow
                  icon={
                    <Target size={19} />
                  }
                  color="purple"
                  title="Goal Achievement"
                  value={
                    newRemaining < 0
                      ? "Delayed"
                      : "On Track"
                  }
                  change=""
                />

              </div>

              {newRemaining < 0 && (
                <p className="goal-delay">
                  Your goals may take longer
                  to achieve because this purchase
                  exceeds your available budget.
                </p>
              )}

            </div>

            {/* RECOMMENDATION */}

            <div className="buy-panel recommendation-panel">

              <div className="recommendation-title">

                <Lightbulb size={27} />

                <h2>
                  Recommendation
                </h2>

              </div>

              <div
                className={
                  isRecommended
                    ? "recommendation-box good"
                    : "recommendation-box bad"
                }
              >

                <div className="recommendation-alert">

                  {isRecommended ? (
                    <TrendingUp size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}

                </div>

                <div>

                  <strong>

                    {isRecommended
                      ? "Looks Affordable"
                      : "Not Recommended"}

                  </strong>

                  <p>

                    {isRecommended
                      ? "This purchase fits within your current available budget."
                      : "This purchase will exceed your available budget and significantly affect your savings rate."
                    }

                  </p>

                </div>

              </div>

              <h3>
                Suggestions:
              </h3>

              <ul className="suggestion-list">

                <li>
                  Consider a more affordable alternative
                </li>

                <li>
                  Wait and save for a few months
                </li>

                <li>
                  Look for discounts or EMI options
                </li>

                <li>
                  Prioritize your financial goals
                </li>

              </ul>

            </div>

          </div>

        </section>

      </main>


      {showHowItWorks && (

        <div
          className="how-modal-overlay"
          onClick={() =>
            setShowHowItWorks(false)
          }
        >

          <div
            className="how-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="how-modal-close"
              onClick={() =>
                setShowHowItWorks(false)
              }
            >
              <X size={19} />
            </button>

            <div className="how-modal-icon">
              <Calculator size={27} />
            </div>

            <h2>
              How Before You Buy Works
            </h2>

            <p>
              ExpenseFlow helps you understand the
              financial impact of a purchase before
              you actually spend the money.
            </p>

            <div className="how-step">

              <span>1</span>

              <div>

                <strong>
                  Enter your purchase
                </strong>

                <p>
                  Add the item name, category and price.
                </p>

              </div>

            </div>

            <div className="how-step">

              <span>2</span>

              <div>

                <strong>
                  Choose purchase type
                </strong>

                <p>
                  Select whether the purchase is
                  one-time or recurring.
                </p>

              </div>

            </div>

            <div className="how-step">

              <span>3</span>

              <div>

                <strong>
                  Simulate the impact
                </strong>

                <p>
                  See your remaining budget and
                  savings rate after the purchase.
                </p>

              </div>

            </div>

            <div className="how-step">

              <span>4</span>

              <div>

                <strong>
                  Ask Vajp Expense
                </strong>

                <p>
                  Let your AI money advisor interpret
                  the financial impact and recommend
                  whether to buy, wait or avoid.
                </p>

              </div>

            </div>

            <button
              className="how-modal-button"
              onClick={() =>
                setShowHowItWorks(false)
              }
            >
              Got it
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


function ImpactRow({
  icon,
  color,
  title,
  value,
  change,
}) {
  return (
    <div className="impact-row">

      <div className={`impact-icon ${color}`}>
        {icon}
      </div>

      <div className="impact-title">
        {title}
      </div>

      <strong>
        {value}
      </strong>

      {change && (
        <span
          className={`impact-change ${color}`}
        >
          {change}
        </span>
      )}

    </div>
  );
}


function Alternative({
  name,
  price,
  saving,
  type,
  onClick,
}) {
  return (
    <button
      type="button"
      className="alternative-card"
      onClick={onClick}
    >

      <div
        className={`alternative-image ${type}`}
      >
        <div className="mini-phone"></div>
      </div>

      <div className="alternative-info">

        <strong>
          {name}
        </strong>

        <b>
          ₹{price}
        </b>

        <span>
          Save {saving}
        </span>

      </div>

    </button>
  );
}

export default Simulator;