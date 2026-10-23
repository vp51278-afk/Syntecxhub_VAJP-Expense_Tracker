
const getAIAdvisor = require("../services/aiAdvisor");

const getAdvisorRecommendation = async (req, res) => {
  try {
    const {
      monthlyIncome,
      currentExpenses,
      balance,
      safeToSpend,
      itemName,
      price,
      category,
      purchaseType,
      reason,
      goals,
    } = req.body || {};

    // Validate required financial and purchase information.
    if (
      monthlyIncome === undefined ||
      currentExpenses === undefined ||
      balance === undefined ||
      safeToSpend === undefined ||
      !itemName ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required financial and purchase information is missing.",
      });
    }

    // Convert numeric fields and reject invalid values.
    const monthlyIncomeValue = Number(monthlyIncome);
    const currentExpensesValue = Number(currentExpenses);
    const balanceValue = Number(balance);
    const safeToSpendValue = Number(safeToSpend);
    const priceValue = Number(price);

    const numericValues = [
      monthlyIncomeValue,
      currentExpensesValue,
      balanceValue,
      safeToSpendValue,
      priceValue,
    ];

    if (
      !numericValues.every(Number.isFinite) ||
      monthlyIncomeValue < 0 ||
      currentExpensesValue < 0 ||
      safeToSpendValue < 0 ||
      priceValue <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid financial values and a purchase price greater than zero.",
      });
    }

    if (
      goals !== undefined &&
      !Array.isArray(goals)
    ) {
      return res.status(400).json({
        success: false,
        message: "Goals must be provided as a list.",
      });
    }

    const financialData = {
      monthlyIncome: monthlyIncomeValue,
      currentExpenses: currentExpensesValue,
      balance: balanceValue,
      safeToSpend: safeToSpendValue,
      itemName: String(itemName).trim(),
      price: priceValue,
      category: category || "Other",
      purchaseType: purchaseType || "One-time",
      reason: reason || "Want",
      goals: goals || [],
    };

    if (!financialData.itemName) {
      return res.status(400).json({
        success: false,
        message: "Please provide the purchase item name.",
      });
    }

    const recommendation = await getAIAdvisor(financialData);

    return res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    // Log diagnostic information without logging financial request data
    // or API keys.
    console.error("AI Advisor Error:", {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    const providerStatus = Number(error.status);

    if (providerStatus === 429) {
      return res.status(429).json({
        success: false,
        message:
          "Vajp AI usage limit reached. Please try again later.",
      });
    }

    if (providerStatus === 503) {
      return res.status(503).json({
        success: false,
        message:
          "Vajp AI is temporarily unavailable. Please try again shortly.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to get AI recommendation.",
    });
  }
};

module.exports = {
  getAdvisorRecommendation,
};
