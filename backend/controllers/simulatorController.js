
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getAmount = (transaction) => Math.abs(Number(transaction.amount) || 0);

const getMonthlyExpenses = (transactions) =>
  transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + getAmount(transaction), 0);

const getMonthlyIncome = (transactions) =>
  transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + getAmount(transaction), 0);

const simulatePurchase = async (req, res) => {
  try {
    const {
      itemName,
      price,
      category,
      purchaseType = "one-time",
      purchaseDate,
    } = req.body;

    const purchasePrice = Number(price);

    if (!itemName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter the item name.",
      });
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid purchase price.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a category.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const monthTransactions = await Transaction.find({
      user: req.user.id,
      date: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    let totalIncome = getMonthlyIncome(monthTransactions);
    const currentExpenses = getMonthlyExpenses(monthTransactions);

    // Use profile income only when the month has no recorded income.
    if (totalIncome === 0) {
      totalIncome = Math.max(0, Number(user.monthlyIncome) || 0);
    }

    const savingsTarget = Math.max(
      0,
      Number(user.savingsTarget) || 0
    );

    const remainingBeforePurchase = totalIncome - currentExpenses;
    const remainingAfterPurchase =
      remainingBeforePurchase - purchasePrice;

    const safeToSpend = Math.max(
      0,
      remainingBeforePurchase - savingsTarget
    );

    const incomeImpact =
      totalIncome > 0
        ? Number(((purchasePrice / totalIncome) * 100).toFixed(2))
        : 0;

    const expenseImpact =
      currentExpenses > 0
        ? Number(((purchasePrice / currentExpenses) * 100).toFixed(2))
        : 100;

    let status;
    let recommendation;

    if (
      remainingAfterPurchase >= savingsTarget &&
      purchasePrice <= safeToSpend
    ) {
      status = "safe";
      recommendation =
        "This purchase fits your current monthly finances and savings target.";
    } else if (remainingAfterPurchase >= 0) {
      status = "think-again";
      recommendation =
        "You may be able to afford this, but it could reduce your planned savings. Consider waiting or choosing a cheaper option.";
    } else {
      status = "not-recommended";
      recommendation =
        "This purchase would put your monthly cash flow below zero. Consider postponing it or saving for it first.";
    }

    return res.status(200).json({
      success: true,
      simulation: {
        itemName: itemName.trim(),
        price: purchasePrice,
        category,
        purchaseType,
        purchaseDate: purchaseDate || null,
        totalIncome,
        currentExpenses,
        savingsTarget,
        safeToSpend,
        remainingBeforePurchase,
        remainingAfterPurchase,
        incomeImpact,
        expenseImpact,
        status,
        recommendation,
      },
    });
  } catch (error) {
    console.error("Purchase simulation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to simulate this purchase right now.",
    });
  }
};

module.exports = { simulatePurchase };
