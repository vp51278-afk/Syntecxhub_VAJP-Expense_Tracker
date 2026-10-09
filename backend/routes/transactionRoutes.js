const express = require("express");

const {
  addTransaction,
  getTransactions,
  deleteTransaction,
} = require("../controllers/transactionController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Add transaction
router.post(
  "/",
  protect,
  addTransaction
);


// Get all user's transactions
router.get(
  "/",
  protect,
  getTransactions
);


// Delete transaction
router.delete(
  "/:id",
  protect,
  deleteTransaction
);


module.exports = router;