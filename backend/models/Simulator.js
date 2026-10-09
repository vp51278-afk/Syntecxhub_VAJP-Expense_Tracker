const mongoose = require("mongoose");

const simulatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    purchaseType: {
      type: String,
      enum: ["One-time", "Recurring"],
      default: "One-time",
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    totalIncome: {
      type: Number,
      default: 0,
    },

    currentExpenses: {
      type: Number,
      default: 0,
    },

    remainingBeforePurchase: {
      type: Number,
      default: 0,
    },

    remainingAfterPurchase: {
      type: Number,
      default: 0,
    },

    incomeImpact: {
      type: Number,
      default: 0,
    },

    expenseImpact: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "safe",
        "think-again",
        "not-recommended",
      ],
      default: "safe",
    },

    recommendation: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Simulator = mongoose.model(
  "Simulator",
  simulatorSchema
);

module.exports = Simulator;