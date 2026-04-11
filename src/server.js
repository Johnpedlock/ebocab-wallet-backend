// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ================= ROUTES =================
const walletRoutes = require("./routes/wallet");
const webhookRoutes = require("./routes/webhook");

// ================= APP INIT =================
const app = express();

// ================= GLOBAL MIDDLEWARE =================
app.use(cors({
  origin: "*", // you can restrict later
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json({
  limit: "10mb" // prevent payload abuse
}));

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "EBOCAB Wallet Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ================= KEEP ALIVE (FOR RENDER) =================
// Useful for cron ping or uptime monitor
app.get("/health", (req, res) => {
  res.status(200).json({ status: "alive" });
});

// ================= API ROUTES =================
app.use("/api/wallet", walletRoutes);
app.use("/api/webhook", webhookRoutes);

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= GRACEFUL SHUTDOWN =================
process.on("SIGINT", () => {
  console.log("🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received...");
  server.close(() => {
    console.log("✅ Server terminated");
    process.exit(0);
  });
});
