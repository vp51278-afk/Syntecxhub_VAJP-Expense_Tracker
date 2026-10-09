const Budget = require("../models/Budget");

// CREATE / UPDATE BUDGET
const saveBudget = async (req, res) => {
  try {
    const {
      category,
      amount,
      month,
    } = req.body;

    if (!category || !amount || !month) {
      return res.status(400).json({
        success: false,
        message: "Please fill all budget fields.",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Budget amount must be greater than zero.",
      });
    }

    const budget =
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          category,
          month,
        },
        {
          user: req.user.id,
          category,
          amount: Number(amount),
          month,
        },
        {
          returnDocument: "after",
          upsert: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      message: "Budget saved successfully.",
      budget,
    });
  } catch (error) {
    console.error(
      "Save Budget Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to save budget.",
    });
  }
};

// GET BUDGETS
const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;

    const query = {
      user: req.user.id,
    };

    if (month) {
      query.month = month;
    }

    const budgets =
      await Budget.find(query).sort({
        category: 1,
      });

    res.json({
      success: true,
      budgets,
    });
  } catch (error) {
    console.error(
      "Get Budgets Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch budgets.",
    });
  }
};

// DELETE BUDGET
const deleteBudget = async (req, res) => {
  try {
    const budget =
      await Budget.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message:
        "Budget deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Budget Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to delete budgGoal.jset.",
    });
  }
};

module.exports = {
  saveBudget,
  getBudgets,
  deleteBudget,
};