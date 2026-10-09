const express = require("express");

const {
  saveBudget,
  getBudgets,
  deleteBudget,
} = require("../controllers/budgetController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, saveBudget);
router.get("/", protect, getBudgets);
router.delete("/:id", protect, deleteBudget);

module.exports = router;