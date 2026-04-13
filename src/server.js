// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ================= ROUTES =================
const walletRoutes = require("./routes/wallet");
const webhookRoutes = require("./routes/webhook");

// ================= APP INIT =================
const app = express();

// ================= TRUST PROXY (RENDER SAFE) =================
app.set("trust proxy", 1);

// ================= GLOBAL MIDDLEWARE =================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json({ limit: "10mb" }));

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// ================= HEALTH ROUTES =================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "EBOCAB Wallet Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "alive"
  });
});

// ================= API ROUTES (VERY IMPORTANT ORDER) =================

// 🔥 Wallet (main)
app.use("/api/wallet", walletRoutes);

// 🔥 Xallet (patched APK MUST hit this)
app.use("/api/xallet", walletRoutes);

// 🔥 Webhook (payments)
app.use("/api/webhook", webhookRoutes);

// ================= DEBUG ROUTE (OPTIONAL BUT POWERFUL) =================
app.get("/debug/routes", (req, res) => {
  res.json({
    routes: [
      "/api/wallet/*",
      "/api/xallet/*",
      "/api/webhook/*"
    ]
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= GRACEFUL SHUTDOWN =================
const shutdown = () => {
  console.log("🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
