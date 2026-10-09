const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    monthlyIncome: {
      type: Number,
      default: 0,
    },

    savingsTarget: {
      type: Number,
      default: 0,
    },

    riskPreference: {
      type: String,
      enum: ["Conservative", "Moderate", "Aggressive"],
      default: "Moderate",
    },

    currency: {
      type: String,
      default: "INR",
    },

    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;