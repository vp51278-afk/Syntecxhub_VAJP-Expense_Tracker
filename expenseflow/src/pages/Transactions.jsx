import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  ShoppingCart,
  Bus,
  Utensils,
  Home,
  Wallet,
  TrendingUp,
  X,
  Save,
  ChevronDown,
  Trash2,
  Receipt,
  BarChart3,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import "./Transactions.css";


function Transactions() {
  const navigate = useNavigate();


  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    type: "expense",
    title: "",
    category: "Food",
    amount: "",
    date: "2026-09-15",
  });


  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    month: "September 2026",
  });



  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);


  const getToken = () => {
    return localStorage.getItem("token");
  };


  const fetchTransactions = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setLoading(true);

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
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

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
        "Unable to connect to server. Please make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTransactions();
  }, []);


  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.amount ||
      !form.date
    ) {
      alert(
        "Please fill all required fields."
      );

      return;
    }

    if (Number(form.amount) <= 0) {
      alert(
        "Amount must be greater than zero."
      );

      return;
    }

    try {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/transactions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: form.title.trim(),
            category: form.category,
            amount: Number(form.amount),
            type: form.type,
            date: form.date,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to save transaction."
        );

        return;
      }

      // Add newly created transaction
      // to the beginning of the list.
      setTransactions((prev) => [
        data.transaction,
        ...prev,
      ]);

      // Reset form
      setForm({
        type: "expense",
        title: "",
        category: "Food",
        amount: "",
        date: "2026-09-15",
      });

      setShowModal(false);

    } catch (error) {
      console.error(
        "Add Transaction Error:",
        error
      );

      alert(
        "Unable to connect to server."
      );

    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (
    transactionId
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setDeletingId(transactionId);

      const response = await fetch(
        `http://localhost:5000/api/transactions/${transactionId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to delete transaction."
        );

        return;
      }

      setTransactions((prev) =>
        prev.filter(
          (transaction) =>
            transaction._id !== transactionId
        )
      );

    } catch (error) {
      console.error(
        "Delete Transaction Error:",
        error
      );

      alert(
        "Unable to connect to server."
      );

    } finally {
      setDeletingId(null);
    }
  };


  // ========================================
  // GET TRANSACTION ICON
  // ========================================

  const getTransactionIcon = (
    category,
    type
  ) => {
    if (type === "income") {
      return <Wallet size={20} />;
    }

    switch (category) {
      case "Food":
        return <Utensils size={20} />;

      case "Transport":
        return <Bus size={20} />;

      case "Housing":
        return <Home size={20} />;

      case "Shopping":
        return <ShoppingCart size={20} />;

      case "Bills":
        return <Receipt size={20} />;

      case "Entertainment":
        return <BarChart3 size={20} />;

      default:
        return <ShoppingCart size={20} />;
    }
  };


  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const transactionDate =
      new Date(date);

    if (
      Number.isNaN(
        transactionDate.getTime()
      )
    ) {
      return date;
    }

    return transactionDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) => {
        const title =
          transaction.title?.toLowerCase() || "";

        const searchValue =
          search.toLowerCase();

        const matchesSearch =
          title.includes(searchValue);

        const matchesType =
          filters.type === "all" ||
          transaction.type === filters.type;

        const matchesCategory =
          filters.category === "all" ||
          transaction.category ===
            filters.category;

        let matchesMonth = true;

        if (filters.month !== "all") {
          const transactionDate =
            new Date(transaction.date);

          const selectedMonth =
            new Date(
              `${filters.month} 01`
            );

          if (
            !Number.isNaN(
              transactionDate.getTime()
            ) &&
            !Number.isNaN(
              selectedMonth.getTime()
            )
          ) {
            matchesMonth =
              transactionDate.getMonth() ===
                selectedMonth.getMonth() &&
              transactionDate.getFullYear() ===
                selectedMonth.getFullYear();
          }
        }

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory &&
          matchesMonth
        );
      }
    );
  }, [
    transactions,
    search,
    filters,
  ]);


  // ========================================
  // SUMMARY
  // ========================================

  const totalIncome = transactions
    .filter(
      (item) =>
        item.type === "income"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );


  const totalExpenses = transactions
    .filter(
      (item) =>
        item.type === "expense"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );


  // ========================================
  // RESET FILTERS
  // ========================================

  const resetFilters = () => {
    setFilters({
      type: "all",
      category: "all",
      month: "September 2026",
    });

    setSearch("");
  };


  return (
    <div className="transactions-page">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="dashboard-sidebar">

        <Link
          to="/dashboard"
          className="dashboard-logo"
        >
          <div className="dashboard-logo-icon">
            E
          </div>

          <span>
            Expense<span>Flow</span>
          </span>
        </Link>


        <nav className="dashboard-menu">

          <Link
            className="dashboard-menu-item"
            to="/dashboard"
          >
            <Wallet size={21} />
            Dashboard
          </Link>


          <Link
            className="dashboard-menu-item active"
            to="/transactions"
          >
            <TrendingUp size={21} />
            Transactions
          </Link>


          <Link
            className="dashboard-menu-item"
            to="/analytics"
          >
            <TrendingUp size={21} />
            Analytics
          </Link>


          <Link
            className="dashboard-menu-item"
            to="/goals"
          >
            <TrendingUp size={21} />
            Goals
          </Link>


          <Link
            className="dashboard-menu-item"
            to="/simulator"
          >
            <ShoppingCart size={21} />
            Before You Buy
          </Link>


          <Link
            className="dashboard-menu-item"
            to="/profile"
          >
            <Wallet size={21} />
            Profile
          </Link>

        </nav>

      </aside>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="transactions-content">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="transactions-header">

          <div>

            <Link
              to="/dashboard"
              className="back-dashboard"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <h1>
              Transactions
            </h1>

            <p>
              Track and manage all your income and expenses.
            </p>

          </div>


          <button
            className="add-new-button"
            onClick={() =>
              setShowModal(true)
            }
          >
            <Plus size={18} />
            Add Transaction
          </button>

        </div>


        {/* =====================================
            SUMMARY
        ===================================== */}

        <div className="transaction-summary">

          <div className="transaction-summary-card">

            <span>
              Total Income
            </span>

            <strong>
              ₹
              {totalIncome.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small className="income-text">
              Total recorded income
            </small>

          </div>


          <div className="transaction-summary-card">

            <span>
              Total Expenses
            </span>

            <strong>
              ₹
              {totalExpenses.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small className="expense-text">
              Total recorded expenses
            </small>

          </div>


          <div className="transaction-summary-card">

            <span>
              Transactions
            </span>

            <strong>
              {transactions.length}
            </strong>

            <small>
              Total transactions
            </small>

          </div>

        </div>


        {/* =====================================
            TOOLBAR
        ===================================== */}

        <div className="transaction-toolbar">


          {/* SEARCH */}

          <div className="transaction-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* FILTER */}

          <div className="filter-wrapper">

            <button
              className="filter-button"
              onClick={() =>
                setShowFilters(
                  !showFilters
                )
              }
            >
              <Filter size={17} />

              Filter

              <ChevronDown size={15} />
            </button>


            {showFilters && (

              <div className="filter-dropdown">

                <div className="filter-dropdown-title">
                  Filter Transactions
                </div>


                <label>
                  Type
                </label>

                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="all">
                    All Transactions
                  </option>

                  <option value="expense">
                    Expenses
                  </option>

                  <option value="income">
                    Income
                  </option>
                </select>


                <label>
                  Category
                </label>

                <select
                  value={
                    filters.category
                  }
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      category:
                        e.target.value,
                    })
                  }
                >
                  <option value="all">
                    All Categories
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Transport">
                    Transport
                  </option>

                  <option value="Housing">
                    Housing
                  </option>

                  <option value="Shopping">
                    Shopping
                  </option>

                  <option value="Bills">
                    Bills
                  </option>

                  <option value="Entertainment">
                    Entertainment
                  </option>

                  <option value="Income">
                    Income
                  </option>
                </select>


                <button
                  className="reset-filter"
                  onClick={
                    resetFilters
                  }
                >
                  Reset Filters
                </button>

              </div>

            )}

          </div>


          {/* MONTH */}

          <select
            className="transaction-select"
            value={filters.month}
            onChange={(e) =>
              setFilters({
                ...filters,
                month: e.target.value,
              })
            }
          >

            <option value="September 2026">
              September 2026
            </option>

            <option value="August 2026">
              August 2026
            </option>

            <option value="July 2026">
              July 2026
            </option>

            <option value="June 2026">
              June 2026
            </option>

            <option value="all">
              All Dates
            </option>

          </select>

        </div>


        {/* =====================================
            TRANSACTION LIST
        ===================================== */}

        <div className="transaction-list-panel">


          <div className="transaction-list-header">

            <span>
              Transaction
            </span>

            <span>
              Category
            </span>

            <span>
              Date
            </span>

            <span>
              Amount
            </span>

            <span>
              Action
            </span>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="no-transactions">

              <div className="transaction-loading">
                Loading transactions...
              </div>

            </div>

          ) : filteredTransactions.length > 0 ? (

            filteredTransactions.map(
              (transaction) => (

                <TransactionRow
                  key={transaction._id}
                  icon={getTransactionIcon(
                    transaction.category,
                    transaction.type
                  )}
                  title={
                    transaction.title
                  }
                  category={
                    transaction.category
                  }
                  date={formatDate(
                    transaction.date
                  )}
                  amount={
                    transaction.amount
                  }
                  type={
                    transaction.type
                  }
                  deleting={
                    deletingId ===
                    transaction._id
                  }
                  onDelete={() =>
                    handleDeleteTransaction(
                      transaction._id
                    )
                  }
                />

              )
            )

          ) : (

            <div className="no-transactions">

              <Search size={30} />

              <h3>
                No transactions found
              </h3>

              <p>
                Try changing your search or filters.
              </p>

            </div>

          )}

        </div>

      </main>


      {/* =====================================
          ADD TRANSACTION MODAL
      ===================================== */}

      {showModal && (

        <div
          className="transaction-modal-overlay"
          onClick={() =>
            !saving &&
            setShowModal(false)
          }
        >

          <div
            className="transaction-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="transaction-modal-header">

              <div>

                <span>
                  MONEY MANAGEMENT
                </span>

                <h2>
                  Add Transaction
                </h2>

              </div>


              <button
                className="modal-close"
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM */}

            <form
              className="transaction-form"
              onSubmit={
                handleAddTransaction
              }
            >


              {/* TYPE */}

              <div className="transaction-type-buttons">

                <button
                  type="button"
                  disabled={saving}
                  className={
                    form.type ===
                    "expense"
                      ? "type-button active-expense"
                      : "type-button"
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      type: "expense",
                    })
                  }
                >
                  Expense
                </button>


                <button
                  type="button"
                  disabled={saving}
                  className={
                    form.type ===
                    "income"
                      ? "type-button active-income"
                      : "type-button"
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      type: "income",
                    })
                  }
                >
                  Income
                </button>

              </div>


              {/* NAME */}

              <div className="form-field">

                <label>
                  Transaction Name
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Grocery Shopping"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />

              </div>


              {/* CATEGORY */}

              <div className="form-field">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                >

                  <option value="Food">
                    Food
                  </option>

                  <option value="Transport">
                    Transport
                  </option>

                  <option value="Housing">
                    Housing
                  </option>

                  <option value="Shopping">
                    Shopping
                  </option>

                  <option value="Bills">
                    Bills
                  </option>

                  <option value="Entertainment">
                    Entertainment
                  </option>

                  <option value="Income">
                    Income
                  </option>

                </select>

              </div>


              {/* AMOUNT */}

              <div className="form-field">

                <label>
                  Amount
                </label>

                <div className="amount-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    placeholder="0"
                    min="1"
                    value={
                      form.amount
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    required
                  />

                </div>

              </div>


              {/* DATE */}

              <div className="form-field">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={
                    form.date
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />

              </div>


              {/* SAVE */}

              <button
                type="submit"
                className="save-transaction-button"
                disabled={saving}
              >

                <Save size={18} />

                {saving
                  ? "Saving..."
                  : "Save Transaction"}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


// ============================================================
// TRANSACTION ROW
// ============================================================

function TransactionRow({
  icon,
  title,
  category,
  date,
  amount,
  type,
  deleting,
  onDelete,
}) {

  return (

    <div className="transaction-table-row">

      <div className="transaction-name">

        <div className="transaction-big-icon">
          {icon}
        </div>

        <strong>
          {title}
        </strong>

      </div>


      <span className="transaction-category">
        {category}
      </span>


      <span className="transaction-date">
        {date}
      </span>


      <strong
        className={
          type === "income"
            ? "amount-income"
            : "amount-expense"
        }
      >

        {type === "income"
          ? "+"
          : "-"}

        ₹
        {Number(
          amount || 0
        ).toLocaleString("en-IN")}

      </strong>


      <button
        type="button"
        className="transaction-delete-button"
        disabled={deleting}
        onClick={onDelete}
        title="Delete transaction"
      >

        <Trash2 size={17} />

      </button>

    </div>

  );
}


export default Transactions;