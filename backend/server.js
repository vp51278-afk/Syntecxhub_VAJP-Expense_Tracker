
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const advisorRoutes = require("./routes/advisorRoutes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);


const normalizeOrigin = (url) =>
  url.trim().replace(/\/+$/, "");

const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map(normalizeOrigin),
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map(normalizeOrigin),
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ExpenseFlow API is running 🚀",
    status: "ok",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    api: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

let dbConnectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI environment variable is missing"
    );
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        dbConnectionPromise = null;
        throw error;
      });
  }

  await dbConnectionPromise;
}

// Connect before processing API requests.
// Health checks above remain accessible if MongoDB is unavailable.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    return res.status(503).json({
      success: false,
      message: "Database connection unavailable",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/simulator", simulatorRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/advisor", advisorRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.message === "CORS origin not allowed") {
    return res.status(403).json({
      success: false,
      message: "This frontend origin is not allowed",
    });
  }

  if (
    error instanceof SyntaxError &&
    "body" in error
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  console.error("API error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});


module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `ExpenseFlow API running at http://localhost:${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error(
        "Server startup failed:",
        error.message
      );
      process.exitCode = 1;
    });
}

