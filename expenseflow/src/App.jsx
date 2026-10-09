import {

  Routes,

  Route,

  Link,

} from "react-router-dom";

import {

  ArrowRight,

  Play,

  Bell,

  CalendarDays,

  ChevronDown,

  Home,

  CreditCard,

  BarChart3,

  Target,

  Brain,

  User,

  ShoppingCart,

  PieChart,

  TrendingUp,

  Wallet,

  Bot,

  Send,

  X,

  Sparkles,

} from "lucide-react";

import { useState } from "react";

import "./index.css";

import Signup from "./pages/Signup";

import Login from "./pages/Login";

import Transactions from "./pages/Transactions";

import Goals from "./pages/Goals";

import Analytics from "./pages/Analytics";

import Simulator from "./pages/Simulator";

import Budget from "./pages/Budget";

import Profile from "./pages/Profile";

import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import ReactMarkdown from "react-markdown";
function DashboardPreview() {

  return (

    <div className="dashboard">

      <aside className="sidebar">

        <Link

          to="/dashboard"

          className="dash-logo"

        >

          <div className="logo-small">

            E

          </div>

          <span>

            Expense<span>Flow</span>

          </span>

        </Link>

        <div className="menu">

          <Link

            to="/dashboard"

            className="menu-item active"

          >

            <Home size={16} />

            Dashboard

          </Link>

          <Link

            to="/transactions"

            className="menu-item"

          >

            <CreditCard size={16} />

            Transactions

          </Link>

          <Link

            to="/analytics"

            className="menu-item"

          >

            <BarChart3 size={16} />

            Analytics

          </Link>

          <Link

            to="/budgets"

            className="menu-item"

          >

            <Wallet size={16} />

            Budgets

          </Link>

          <Link

            to="/goals"

            className="menu-item"

          >

            <Target size={16} />

            Goals

          </Link>

          <Link

            to="/simulator"

            className="menu-item"

          >

            <TrendingUp size={16} />

            Simulator

          </Link>

          <Link

            to="/profile"

            className="menu-item"

          >

            <User size={16} />

            Profile

          </Link>

        </div>

      </aside>

      <main className="dashboard-main">

        <div className="dashboard-top">

          <div>

            <h3>

              Hello, Vaishnavi 👋

            </h3>

            <p>

              Here's your financial overview

            </p>

          </div>

          <div className="dashboard-actions">

            <button className="month">

              Sep 2026

              <ChevronDown size={14} />

            </button>

            <button className="calendar">

              <CalendarDays size={16} />

            </button>

            <Bell size={17} />

            <div className="avatar">

              V

            </div>

          </div>

        </div>

        <div className="stats">

          <StatCard

            title="Total Balance"

            value="₹42,500"

            change="↑ 12%"

            positive

          />

          <StatCard

            title="Monthly Income"

            value="₹60,000"

            change="↑ 8%"

            positive

          />

          <StatCard

            title="Monthly Expenses"

            value="₹17,500"

            change="↓ 5%"

          />

          <StatCard

            title="Safe to Spend"

            value="₹7,200"

            change="Based on your goals"

          />

        </div>

        <div className="dashboard-grid">

          <div className="panel">

            <div className="panel-header">

              <h4>

                Spending Trend

              </h4>

              <div className="legend">

                <span>

                  <i className="dot green"></i>

                  Income

                </span>

                <span>

                  <i className="dot red"></i>

                  Expenses

                </span>

              </div>

            </div>

            <div className="chart">

              <div className="y-labels">

                <span>20K</span>

                <span>15K</span>

                <span>10K</span>

                <span>5K</span>

                <span>0</span>

              </div>

              <svg

                viewBox="0 0 600 220"

                className="line-chart"

              >

                <polyline

                  points="

                    40,180

                    140,150

                    240,120

                    340,145

                    440,90

                    540,60

                  "

                  fill="none"

                  stroke="#ff3152"

                  strokeWidth="3"

                />

                <polyline

                  points="

                    40,195

                    140,175

                    240,145

                    340,165

                    440,125

                    540,105

                  "

                  fill="none"

                  stroke="#16d6a1"

                  strokeWidth="3"

                />

              </svg>

            </div>

          </div>

          {/* CATEGORY */}

          <div className="panel">

            <div className="panel-header">

              <h4>

                Spending by Category

              </h4>

            </div>

            <div className="category-chart">

              <div className="donut">

                <strong>

                  ₹17,500

                </strong>

                <span>

                  Total

                </span>

              </div>

              <div className="category-list">

                <Category

                  name="Food"

                  value="30%"

                />

                <Category

                  name="Transport"

                  value="20%"

                />

                <Category

                  name="Shopping"

                  value="15%"

                />

                <Category

                  name="Bills"

                  value="15%"

                />

                <Category

                  name="Entertainment"

                  value="10%"

                />

                <Category

                  name="Others"

                  value="10%"

                />

              </div>

            </div>

          </div>

        </div>

        <div className="bottom-panels">

          {/* RECENT TRANSACTIONS */}

          <div className="panel transactions">

            <div className="panel-header">

              <h4>

                Recent Transactions

              </h4>

              <Link

                to="/transactions"

                className="view-all"

              >

                View all →

              </Link>

            </div>

            <Transaction

              icon="🛒"

              name="Grocery Shopping"

              category="Food"

              date="14 Sep 2026"

              amount="-₹1,850"

            />

            <Transaction

              icon="🚇"

              name="Metro Recharge"

              category="Transport"

              date="12 Sep 2026"

              amount="-₹500"

            />

            <Transaction

              icon="🍔"

              name="Dinner"

              category="Food"

              date="10 Sep 2026"

              amount="-₹650"

            />

          </div>

          {/* BEFORE YOU BUY */}

          <div className="panel before-buy">

            <div className="buy-icon">

              <ShoppingCart size={18} />

            </div>

            <h4>

              Before You Buy

            </h4>

            <p>

              Thinking about a purchase?

              <br />

              See how it affects your goals.

            </p>

            <Link

              to="/simulator"

              className="before-buy-button"

            >

              Simulate Purchase

              <ArrowRight size={15} />

            </Link>

          </div>

        </div>

      </main>

    </div>

  );

}

function StatCard({

  title,

  value,

  change,

  positive,

}) {

  return (

    <div className="stat-card">

      <span>

        {title}

      </span>

      <strong>

        {value}

      </strong>

      <small

        className={

          positive

            ? "positive"

            : "negative"

        }

      >

        {change}

      </small>

    </div>

  );

}

function Category({

  name,

  value,

}) {

  return (

    <div className="category">

      <span>

        <i></i>

        {name}

      </span>

      <strong>

        {value}

      </strong>

    </div>

  );

}

function Transaction({

  icon,

  name,

  category,

  date,

  amount,

}) {

  return (

    <div className="transaction">

      <div className="transaction-name">

        <div className="transaction-icon">

          {icon}

        </div>

        <div>

          <strong>

            {name}

          </strong>

          <span>

            {category}

          </span>

        </div>

      </div>

      <div className="transaction-right">

        <small>

          {date}

        </small>

        <strong>

          {amount}

        </strong>

      </div>

    </div>

  );

}

function PhoneDashboard() {

  return (

    <div className="phone">

      <div className="phone-speaker"></div>

      <div className="phone-screen">

        {/* PHONE HEADER */}

        <div className="phone-header">

          <div className="dash-logo">

            <div className="logo-small">

              E

            </div>

            <span>

              Expense<span>Flow</span>

            </span>

          </div>

          <div>

            ☰

          </div>

        </div>

        {/* TITLE */}

        <div className="phone-title">

          <h3>

            Hello, Vaishnavi 👋

          </h3>

          <p>

            Your finances at a glance

          </p>

        </div>

        {/* SAFE TO SPEND */}

        <div className="safe-box">

          <div>

            <span>

              Safe to Spend Today

            </span>

            <strong>

              ₹7,200

            </strong>

          </div>

          <ArrowRight />

        </div>

        {/* BALANCE */}

        <div className="phone-balance">

          <span>

            Total Balance

          </span>

          <strong>

            ₹42,500

          </strong>

          <small>

            ↑ 12%

          </small>

        </div>

        {/* EXPENSE */}

        <div className="phone-expense">

          <span>

            Monthly Expenses

          </span>

          <strong>

            ₹17,500

          </strong>

          <small>

            ↓ 5%

          </small>

        </div>

        {/* CATEGORY */}

        <div className="phone-category">

          <h4>

            Spending by Category

          </h4>

          <div className="mini-donut">

            <div>

              <strong>

                ₹17,500

              </strong>

              <span>

                Total

              </span>

            </div>

          </div>

          <div className="mini-list">

            <span>● Food</span>

            <span>● Transport</span>

            <span>● Shopping</span>

            <span>● Bills</span>

            <span>● Entertainment</span>

          </div>

        </div>

        {/* PHONE NAV */}

        <div className="phone-nav">

          <span>

            ⌂

            <small>

              Home

            </small>

          </span>

          <span>

            ⇄

            <small>

              Transactions

            </small>

          </span>

          <span>

            ◎

            <small>

              Goals

            </small>

          </span>

          <span>

            ♙

            <small>

              Profile

            </small>

          </span>

        </div>

      </div>

    </div>

  );

}

function Landing() {

  const [vajpOpen, setVajpOpen] = useState(false);

  const [vajpMessage, setVajpMessage] = useState("");

  const [vajpLoading, setVajpLoading] = useState(false);

  const [vajpResponse, setVajpResponse] = useState(null);

  const askVajpExpense = async () => {
    const question = vajpMessage.trim();
    if (!question || vajpLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setVajpResponse({
        decision: null,
        reason: "Please log in first to use personalized Vajp Expense advice.",
        action: "Open Login and sign in to your ExpenseFlow account.",
      });
      return;
    }

    setVajpLoading(true);
    setVajpResponse(null);

    try {
      const response = await fetch("http://localhost:5000/api/advisor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      setVajpResponse(data.data);
    } catch (error) {
      console.error("Vajp Expense Error:", error);
      setVajpResponse({
        decision: null,
        reason: error.message || "An unexpected error occurred.",
        action: "Check the backend terminal for more details.",
      });
    } finally {
      setVajpLoading(false);
    }
  };
  const openVajp = () => setVajpOpen(true);

  const closeVajp = () => setVajpOpen(false);

  return (

    <div className="app">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <Link

          to="/"

          className="brand"

        >

          <img

            src="/expenseflow-logo.png"

            alt="ExpenseFlow"

            className="brand-image"

          />

        </Link>

        <nav>

          <a

            className="active"

            href="#home"

          >

            Home

          </a>

          <a href="#features">

            Features

          </a>

          <a href="#how">

            How It Works

          </a>

          <a href="#pricing">

            Pricing

          </a>

          <a href="#about">

            About

          </a>

        </nav>

        <div className="nav-buttons">

          <Link

            to="/login"

            className="login"

          >

            Login

          </Link>

          <Link

            to="/signup"

            className="get-started"

          >

            Get Started

          </Link>

        </div>

      </header>

      <section

        className="hero"

        id="home"

      >

        <div className="glow glow-one"></div>

        <div className="glow glow-two"></div>

        <div className="hero-content">

          {/* HERO LEFT */}

          <div className="hero-left">

            <button

              type="button"

              className="eyebrow vajp-eyebrow"

              onClick={openVajp}

            >

              <span className="vajp-eyebrow-icon"><Bot size={16} /></span>

              <strong>Vajp Expense</strong>

              <span className="vajp-eyebrow-text">Your Personal AI Money Advisor</span>

              <Sparkles size={15} className="vajp-eyebrow-sparkle" />

            </button>

            <h1>

              Track. Plan. Decide.

              <br />

              <span>

                A Better You.

              </span>

            </h1>

            <p className="hero-description">

              ExpenseFlow helps you track your expenses,

              build financial goals, and see how today's

              decisions impact your tomorrow.

            </p>

            <div className="hero-buttons">

              <Link

                to="/signup"

                className="primary-button"

              >

                Get Started

                <ArrowRight size={20} />

              </Link>

              <button

                type="button"

                className="demo-button vajp-demo-button"

                onClick={openVajp}

              >

                <span className="play-icon"><Bot size={15} /></span>

                Ask Vajp Expense

              </button>

            </div>

            <div className="users">

              <div className="avatars">

                <div>👩🏻</div>

                <div>👨🏽</div>

                <div>👩🏽</div>

                <div>👨🏻</div>

              </div>

              <p>

                Join <strong>10,000+</strong> users

                <br />

                taking control of their finances.

              </p>

            </div>

          </div>

          {/* ================= DASHBOARD PREVIEW ================= */}

          <div className="hero-dashboard">

            <div className="laptop">

              <div className="laptop-screen">

                <DashboardPreview />

              </div>

              <div className="laptop-bottom">

                <div className="laptop-trackpad"></div>

              </div>

            </div>

            <PhoneDashboard />

          </div>

        </div>

        {/* ================= FEATURES ================= */}

        <div className="vajp-feature-card">

          <div className="vajp-feature-icon"><Bot size={27} /></div>

          <div className="vajp-feature-content">

            <div className="vajp-feature-title"><span>Vajp Expense</span><Sparkles size={16} /></div>

            <h3>Don't just track your money.<br /><span>Ask it what to do next.</span></h3>

            <p>Your AI money advisor can analyze your spending, goals, and purchase decisions to help you make smarter choices.</p>

          </div>

          <button type="button" className="vajp-feature-button" onClick={openVajp}>Talk to Vajp <ArrowRight size={18} /></button>

        </div>

        <div

          className="feature-cards"

          id="features"

        >

          <Feature

            icon={<BarChart3 />}

            title="Track Expenses"

            text="Easily record your income and expenses."

          />

          <Feature

            icon={<Target />}

            title="Set Financial Goals"

            text="Save for what matters with smart goal tracking."

          />

          <Feature

            icon={<Brain />}

            title="Before You Buy"

            text="See how a purchase impacts your future goals."

          />

          <Feature

            icon={<PieChart />}

            title="Get Smart Insights"

            text="Understand your spending habits with clear analytics."

          />

        </div>

      </section>

      <section

        className="simple-section"

        id="how"

      >

        <span className="section-label">

          HOW IT WORKS

        </span>

        <h2>

          Your money.

          <br />

          <span>

            Your decisions.

          </span>

        </h2>

        <p>

          ExpenseFlow gives you a simple way to

          understand your money, plan ahead,

          and make better financial decisions every day.

        </p>

        <div className="steps">

          <div>

            <span>

              01

            </span>

            <h3>

              Track

            </h3>

            <p>

              Know exactly where your money goes.

            </p>

          </div>

          <div>

            <span>

              02

            </span>

            <h3>

              Plan

            </h3>

            <p>

              Create goals that actually fit your life.

            </p>

          </div>

          <div>

            <span>

              03

            </span>

            <h3>

              Decide

            </h3>

            <p>

              Understand the impact before you spend.

            </p>

          </div>

        </div>

      </section>

      <section

        className="cta-section"

        id="pricing"

      >

        <div>

          <span className="section-label">

            START TODAY

          </span>

          <h2>

            Take control of

            <br />

            <span>

              your finances.

            </span>

          </h2>

          <p>

            Build better habits and make smarter financial decisions.

          </p>

        </div>

        <Link

          to="/signup"

          className="primary-button"

        >

          Get Started

          <ArrowRight />

        </Link>

      </section>

      <footer id="about">

        <Link

          to="/"

          className="brand"

        >

          <div className="brand-logo">

            E

          </div>

          <span>

            Expense<span>Flow</span>

          </span>

        </Link>

        <p>

          © 2026 ExpenseFlow. All rights reserved.

        </p>

      </footer>

      {vajpOpen && (

        <div className="vajp-overlay" onClick={closeVajp}>

          <div className="vajp-chat" onClick={(event) => event.stopPropagation()}>

            <div className="vajp-chat-header">

              <div className="vajp-chat-brand">

                <div className="vajp-chat-icon"><Bot size={22} /></div>

                <div><strong>Vajp Expense</strong><span>AI Money Advisor</span></div>

              </div>

              <button type="button" className="vajp-close" onClick={closeVajp}><X size={19} /></button>

            </div>

            <div className="vajp-chat-body">

              {!vajpResponse ? (

                <div className="vajp-welcome">

                  <div className="vajp-welcome-icon"><Sparkles size={24} /></div>

                  <h3>Hi! I'm Vajp Expense 👋</h3>

                  <p>Tell me about a purchase or financial decision you're thinking about.</p>

                  <div className="vajp-suggestions">

                    <button type="button" onClick={() => setVajpMessage("Should I buy a new phone worth ₹30000?")}>📱 Should I buy a ₹30,000 phone?</button>

                    <button type="button" onClick={() => setVajpMessage("Can I afford headphones worth ₹8000?")}>🎧 Can I afford ₹8,000 headphones?</button>

                    <button type="button" onClick={() => setVajpMessage("How can I save more money this month?")}>💰 How can I save more money?</button>

                  </div>

                </div>

              ) : (

                <div className="vajp-chat-result">

                  {vajpResponse.decision && <div className="vajp-decision-mini"><span>Vajp recommends</span><strong>{vajpResponse.decision}</strong></div>}

               
<div className="vajp-answer">
  <strong>Vajp's Advice</strong>
  <div className="vajp-markdown">
    <ReactMarkdown>
      {vajpResponse.reason || "No advice available."}
    </ReactMarkdown>
  </div>
</div>


                  {vajpResponse.goalImpact && <div className="vajp-answer"><strong>Goal Impact</strong><p>{vajpResponse.goalImpact}</p></div>}

                  {vajpResponse.alternative && <div className="vajp-answer"><strong>Alternative</strong><p>{vajpResponse.alternative}</p></div>}

                  {vajpResponse.action && <div className="vajp-next-action"><Sparkles size={18} /><div><strong>Next Step</strong><p>{vajpResponse.action}</p></div></div>}

                  <button type="button" className="vajp-new-question" onClick={() => setVajpResponse(null)}>Ask another question</button>

                </div>

              )}

            </div>

            <div className="vajp-chat-input">

              <input type="text" placeholder="Ask Vajp about your money..." value={vajpMessage} onChange={(event) => setVajpMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") askVajpExpense(); }} />

              <button type="button" onClick={askVajpExpense} disabled={vajpLoading || !vajpMessage.trim()}>{vajpLoading ? <span className="vajp-chat-spinner" /> : <Send size={18} />}</button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

function Feature({

  icon,

  title,

  text,

}) {

  return (

    <div className="feature-card">

      <div className="feature-icon">

        {icon}

      </div>

      <div>

        <h3>

          {title}

        </h3>

        <p>

          {text}

        </p>

      </div>

    </div>

  );

}

function App() {

  return (

    <Routes>

  {/* LANDING */}

  <Route

    path="/"

    element={<Landing />}

  />

  {/* AUTH */}

  <Route

    path="/signup"

    element={<Signup />}

  />

  <Route

    path="/login"

    element={<Login />}

  />

  <Route element={<ProtectedRoute />}>

    {/* DASHBOARD */}

    <Route

      path="/dashboard"

      element={<Dashboard />}

    />

    {/* TRANSACTIONS */}

    <Route

      path="/transactions"

      element={<Transactions />}

    />

    {/* GOALS */}

    <Route

      path="/goals"

      element={<Goals />}

    />

    {/* ANALYTICS */}

    <Route

      path="/analytics"

      element={<Analytics />}

    />

    {/* SIMULATOR */}

    <Route

      path="/simulator"

      element={<Simulator />}

    />

    {/* BUDGET */}

    <Route

      path="/budgets"

      element={<Budget />}

    />

    {/* PROFILE */}

    <Route

      path="/profile"

      element={<Profile />}

    />

  </Route>

</Routes>

  );

}

export default App;
