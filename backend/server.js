const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Load environment variables FIRST
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const advisorRoutes = require("./routes/advisorRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ExpenseFlow API is running 🚀",
  });
});


app.use("/api/auth", authRoutes);


app.use("/api/transactions", transactionRoutes);


app.use("/api/budgets", budgetRoutes);


app.use("/api/goals", goalRoutes);

app.use("/api/simulator", simulatorRoutes);


app.use("/api/analytics", analyticsRoutes);

app.use("/api/advisor", advisorRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log(
      "MongoDB connected successfully ✅"
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed ❌"
    );

    console.error(error.message);

    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `ExpenseFlow server running on port ${PORT} 🚀`
    );

    console.log(
      `http://localhost:${PORT}`
    );
  });
};

startServer();