
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const getAIAdvisor = require("../services/aiAdvisor");

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getFinancialData = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [allTransactions, monthlyTransactions, goals] = await Promise.all([
    Transaction.find({ user: userId }).lean(),
    Transaction.find({
      user: userId,
      date: { $gte: monthStart, $lt: nextMonth },
    }).lean(),
    Goal.find({ user: userId }).lean(),
  ]);

  const sumTransactions = (transactions, type) =>
    transactions.reduce((total, transaction) => {
      if (transaction.type !== type) return total;
      return total + Math.max(0, toNumber(transaction.amount));
    }, 0);

  const monthlyIncome = sumTransactions(monthlyTransactions, "income");
  const currentExpenses = sumTransactions(monthlyTransactions, "expense");
  const allTimeIncome = sumTransactions(allTransactions, "income");
  const allTimeExpenses = sumTransactions(allTransactions, "expense");
  const balance = allTimeIncome - allTimeExpenses;

  const normalizedGoals = goals.map((goal) => ({
    name: goal.title || "Unnamed goal",
    target: Math.max(0, toNumber(goal.target)),
    saved: Math.max(0, toNumber(goal.saved)),
    deadline: goal.deadline || null,
  }));

  const monthlyGoalContributions = normalizedGoals.reduce((total, goal) => {
    const remaining = Math.max(0, goal.target - goal.saved);
    if (remaining === 0 || !goal.deadline) return total;

    const deadline = new Date(goal.deadline);
    if (Number.isNaN(deadline.getTime()) || deadline <= now) return total;

    const monthsRemaining = Math.max(
      1,
      (deadline.getFullYear() - now.getFullYear()) * 12 +
        deadline.getMonth() - now.getMonth() +
        (deadline.getDate() > now.getDate() ? 1 : 0)
    );

    return total + remaining / monthsRemaining;
  }, 0);

  const safeToSpend = Math.max(
    0,
    monthlyIncome - currentExpenses - monthlyGoalContributions
  );

  return {
    monthlyIncome,
    currentExpenses,
    balance,
    safeToSpend,
    monthlyGoalContributions,
    transactionCount: allTransactions.length,
    monthlyTransactionCount: monthlyTransactions.length,
    hasMonthlyIncome: monthlyIncome > 0,
    hasMonthlyExpenses: currentExpenses > 0,
    goals: normalizedGoals,
  };
};

// POST /api/advisor — purchase advice
router.post("/", protect, async (req, res) => {
  try {
    const { itemName, price, category, purchaseType, reason } = req.body;

    if (!itemName || !String(itemName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter an item name.",
      });
    }

    const purchasePrice = Number(price);
    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid purchase price.",
      });
    }

    const finances = await getFinancialData(req.user._id);

    const advice = await getAIAdvisor({
      monthlyIncome: finances.monthlyIncome,
      currentExpenses: finances.currentExpenses,
      balance: finances.balance,
      safeToSpend: finances.safeToSpend,
      itemName: String(itemName).trim(),
      price: purchasePrice,
      category: category || "Shopping",
      purchaseType: purchaseType || "One-time",
      reason: reason || "Not specified",
      goals: finances.goals,
    });

    if (!advice || !["BUY", "WAIT", "AVOID"].includes(advice.decision)) {
      throw new Error("Invalid purchase advice returned by AI.");
    }

    let decision = advice.decision;
    if (
      purchasePrice > finances.safeToSpend ||
      !finances.hasMonthlyIncome
    ) {
      decision = decision === "AVOID" ? "AVOID" : "WAIT";
    }

    const aiAmount = Number(advice.recommendedAmount);
    const recommendedAmount = Math.min(
      finances.safeToSpend,
      Math.max(0, Number.isFinite(aiAmount) ? aiAmount : 0)
    );

    return res.json({
      success: true,
      data: {
        ...advice,
        decision,
        recommendedAmount,
        financialSummary: {
          monthlyIncome: finances.monthlyIncome,
          currentExpenses: finances.currentExpenses,
          balance: finances.balance,
          safeToSpend: finances.safeToSpend,
          monthlyGoalContributions: Math.round(
            finances.monthlyGoalContributions
          ),
          hasMonthlyIncome: finances.hasMonthlyIncome,
          hasMonthlyExpenses: finances.hasMonthlyExpenses,
        },
      },
    });
  } catch (error) {
    console.error("Vajp purchase advisor error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to generate purchase advice right now.",
    });
  }
});

// POST /api/advisor/chat — general financial chat
router.post("/chat", protect, async (req, res) => {
  try {
    const question = String(req.body.question || "").trim();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Please enter a question.",
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Please keep your question under 2000 characters.",
      });
    }

    const finances = await getFinancialData(req.user._id);
    const getGeneralAIResponse = getAIAdvisor.getGeneralAIResponse;

    if (typeof getGeneralAIResponse !== "function") {
      throw new Error("General AI response function is unavailable.");
    }

    const answer = await getGeneralAIResponse(question, {
      currency: "INR",
      monthlyIncome: finances.hasMonthlyIncome
        ? finances.monthlyIncome
        : null,
      monthlyExpenses: finances.hasMonthlyExpenses
        ? finances.currentExpenses
        : null,
      balance: finances.transactionCount > 0 ? finances.balance : null,
      safeToSpend: finances.hasMonthlyIncome
        ? finances.safeToSpend
        : null,
      monthlyGoalContributions: Math.round(
        finances.monthlyGoalContributions
      ),
      hasMonthlyIncome: finances.hasMonthlyIncome,
      hasMonthlyExpenses: finances.hasMonthlyExpenses,
      transactionCount: finances.transactionCount,
      goals: finances.goals,
    });

    return res.json({
      success: true,
      data: {
        decision: null,
        reason: answer,
        goalImpact: "",
        alternative: "",
        action: "",
      },
    });
  } catch (error) {
    console.error("Vajp chat error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to answer your question right now.",
    });
  }
});

module.exports = router;

