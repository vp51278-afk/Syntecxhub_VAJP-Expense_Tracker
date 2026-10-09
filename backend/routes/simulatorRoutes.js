const express = require("express");

const {
  simulatePurchase,
} = require("../controllers/simulatorController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, simulatePurchase);

module.exports = router;