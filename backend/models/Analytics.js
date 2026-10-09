const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    totalIncome: {
      type: Number,
      default: 0,
    },

    totalExpenses: {
      type: Number,
      default: 0,
    },

    savings: {
      type: Number,
      default: 0,
    },

    savingsPercentage: {
      type: Number,
      default: 0,
    },

    totalBudget: {
      type: Number,
      default: 0,
    },

    budgetUsage: {
      type: Number,
      default: 0,
    },

    categories: [
      {
        category: {
          type: String,
          required: true,
        },

        amount: {
          type: Number,
          default: 0,
        },

        percentage: {
          type: Number,
          default: 0,
        },
      },
    ],

    topCategory: {
      category: {
        type: String,
        default: "",
      },

      amount: {
        type: Number,
        default: 0,
      },

      percentage: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model(
  "Analytics",
  analyticsSchema
);

module.exports = Analytics;