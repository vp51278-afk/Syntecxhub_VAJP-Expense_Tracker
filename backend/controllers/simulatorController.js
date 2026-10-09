const Transaction = require("../models/Transaction");
const User = require("../models/User");

// ========================================
// SIMULATE PURCHASE
// ========================================

const simulatePurchase = async (req, res) => {
  try {
    const {
      itemName,
      price,
      category,
      purchaseType,
      purchaseDate,
    } = req.body;

    if (!itemName || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide item name, price and category.",
      });
    }

    const purchasePrice = Number(price);

    if (purchasePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase price must be greater than zero.",
      });
    }

    // ========================================
    // GET USER
    // ========================================

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ========================================
    // CURRENT MONTH
    // ========================================

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // ========================================
    // GET CURRENT MONTH TRANSACTIONS
    // ========================================

    const transactions = await Transaction.find({
      user: req.user.id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    // ========================================
    // USER MONTHLY INCOME FALLBACK
    // ========================================

    if (totalIncome === 0 && user.monthlyIncome) {
      totalIncome = user.monthlyIncome;
    }

    const remainingBeforePurchase =
      totalIncome - totalExpenses;

    const remainingAfterPurchase =
      remainingBeforePurchase - purchasePrice;

    // ========================================
    // AFFORDABILITY
    // ========================================

    let status = "safe";
    let recommendation = "This purchase looks affordable.";

    if (remainingAfterPurchase < 0) {
      status = "not-recommended";

      recommendation =
        "This purchase would exceed your available monthly budget.";
    } else if (
      totalIncome > 0 &&
      purchasePrice > totalIncome * 0.3
    ) {
      status = "think-again";

      recommendation =
        "This purchase is quite large compared with your monthly income.";
    }

    // ========================================
    // IMPACT PERCENTAGE
    // ========================================

    const incomeImpact =
      totalIncome > 0
        ? Number(
            ((purchasePrice / totalIncome) * 100).toFixed(2)
          )
        : 0;

    const expenseImpact =
      remainingBeforePurchase > 0
        ? Number(
            (
              (purchasePrice / remainingBeforePurchase) *
              100
            ).toFixed(2)
          )
        : 0;

    res.json({
      success: true,

      simulation: {
        itemName,
        price: purchasePrice,
        category,
        purchaseType: purchaseType || "One-time",
        purchaseDate: purchaseDate || null,

        totalIncome,
        currentExpenses: totalExpenses,

        remainingBeforePurchase,
        remainingAfterPurchase,

        incomeImpact,
        expenseImpact,

        status,
        recommendation,
      },
    });
  } catch (error) {
    console.error(
      "Simulator Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to simulate purchase.",
    });
  }
};

module.exports = {
  simulatePurchase,
};