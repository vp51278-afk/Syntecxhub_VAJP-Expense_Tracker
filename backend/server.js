
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


const normalizeOrigin = (value = "") =>
  value.trim().replace(/\/+$/, "");

const allowedOrigins = new Set(
  [
    // Production frontend
    "https://syntecxhub-vajp-expense-tracker-ckp.vercel.app",

    // Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    // Additional frontend URLs from Vercel environment
    ...(process.env.FRONTEND_URL || "").split(","),
    ...(process.env.FRONTEND_URLS || "").split(","),
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (health checks, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.has(normalizedOrigin)) {
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

  optionsSuccessStatus: 204,
};

// Register CORS BEFORE API routes, database middleware,
// JSON parsing, and application error handlers.
app.use(cors(corsOptions));

// Application-level cors() handles browser preflight
// requests for the routes below.
app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ExpenseFlow API is running 🚀",
    status: "ok",
  });
});

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    api: "ok",
    database: connected ? "connected" : "disconnected",
  });
});


let dbConnectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing");
  }

  // Reuse a pending connection attempt to avoid duplicate
  // connection attempts during concurrent serverless requests.
  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => mongoose.connection)
      .catch((error) => {
        dbConnectionPromise = null;
        throw error;
      });
  }

  try {
    return await dbConnectionPromise;
  } catch (error) {
    dbConnectionPromise = null;
    throw error;
  }
}

// Reset the cached promise if the connection drops.
mongoose.connection.on("disconnected", () => {
  dbConnectionPromise = null;
});

app.use("/api", async (req, res, next) => {
  // Health checks must still work when MongoDB is offline.
  if (req.path === "/health") {
    return next();
  }

  try {
    await connectDB();
    return next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

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
    error.status === 400 &&
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

// Vercel imports this Express app as a serverless handler.
// For local development, start listening on PORT.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`ExpenseFlow API running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error.message);
      process.exitCode = 1;
    });
}

module.exports = app;
