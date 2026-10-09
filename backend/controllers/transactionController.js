const Transaction = require("../models/Transaction");


// ========================================
// ADD TRANSACTION
// ========================================

const addTransaction = async (req, res) => {
  try {
    const {
      title,
      category,
      amount,
      type,
      date,
    } = req.body;

    if (
      !title ||
      !category ||
      !amount ||
      !type ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all transaction fields.",
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      category,
      amount: Number(amount),
      type,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Transaction added successfully.",
      transaction,
    });

  } catch (error) {
    console.error(
      "Add Transaction Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to add transaction.",
    });
  }
};


// ========================================
// GET TRANSACTIONS
// ========================================

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      transactions,
    });

  } catch (error) {
    console.error(
      "Get Transactions Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch transactions.",
    });
  }
};


// ========================================
// DELETE TRANSACTION
// ========================================

const deleteTransaction = async (req, res) => {
  try {
    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: "Transaction deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Transaction Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to delete transaction.",
    });
  }
};


module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
};