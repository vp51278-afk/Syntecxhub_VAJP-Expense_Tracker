const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// ========================================
// ANALYTICS
// ========================================

const getAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();

    const selectedYear =
      Number(year) || currentDate.getFullYear();

    const selectedMonth =
      month !== undefined
        ? Number(month)
        : currentDate.getMonth();

    // ========================================
    // MONTH RANGE
    // ========================================

    const startOfMonth = new Date(
      selectedYear,
      selectedMonth,
      1
    );

    const endOfMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0,
      23,
      59,
      59
    );

    // ========================================
    // TRANSACTIONS
    // ========================================

    const transactions = await Transaction.find({
      user: req.user.id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).sort({
      date: -1,
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    const categoryTotals = {};

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;

        if (!categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] = 0;
        }

        categoryTotals[transaction.category] +=
          transaction.amount;
      }
    });

    // ========================================
    // CATEGORY DATA
    // ========================================

    const categories = Object.entries(
      categoryTotals
    ).map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpenses > 0
          ? Number(
              ((amount / totalExpenses) * 100).toFixed(2)
            )
          : 0,
    }));

    categories.sort(
      (a, b) => b.amount - a.amount
    );

    // ========================================
    // SAVINGS
    // ========================================

    const savings =
      totalIncome - totalExpenses;

    const savingsPercentage =
      totalIncome > 0
        ? Number(
            ((savings / totalIncome) * 100).toFixed(2)
          )
        : 0;

    // ========================================
    // BUDGETS
    // ========================================

    const monthKey = `${selectedYear}-${String(
      selectedMonth + 1
    ).padStart(2, "0")}`;

    const budgets = await Budget.find({
      user: req.user.id,
      month: monthKey,
    });

    let totalBudget = 0;

    budgets.forEach((budget) => {
      totalBudget += budget.amount;
    });

    const budgetUsage =
      totalBudget > 0
        ? Number(
            ((totalExpenses / totalBudget) * 100).toFixed(2)
          )
        : 0;

    // ========================================
    // RECENT TRANSACTIONS
    // ========================================

    const recentTransactions =
      transactions.slice(0, 10);

    // ========================================
    // TOP SPENDING CATEGORY
    // ========================================

    const topCategory =
      categories.length > 0
        ? categories[0]
        : null;

    // ========================================
    // RESPONSE
    // ========================================

    res.json({
      success: true,

      period: {
        month: selectedMonth,
        year: selectedYear,
        monthKey,
      },

      summary: {
        totalIncome,
        totalExpenses,
        savings,
        savingsPercentage,
        totalBudget,
        budgetUsage,
      },

      categories,

      topCategory,

      recentTransactions,
    });
  } catch (error) {
    console.error(
      "Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to generate analytics.",
    });
  }
};

module.exports = {
  getAnalytics,
};