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
    } = req.body;

    // Basic validation
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
        message: "Required financial and purchase information is missing.",
      });
    }

    const financialData = {
      monthlyIncome: Number(monthlyIncome),
      currentExpenses: Number(currentExpenses),
      balance: Number(balance),
      safeToSpend: Number(safeToSpend),
      itemName,
      price: Number(price),
      category: category || "Other",
      purchaseType: purchaseType || "One-time",
      reason: reason || "Want",
      goals: goals || [],
    };

    const recommendation = await getAIAdvisor(financialData);

    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("AI Advisor Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get AI recommendation.",
      error: error.message,
    });
  }
};

module.exports = {
  getAdvisorRecommendation,
};