const express = require("express");
const router = express.Router();
const db = require("../config/db");

// example cron: cleanup pending transactions
router.get("/cleanup", async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM transactions WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 day'"
    );

    console.log("🧹 Cleanup done:", result.rowCount);

    res.json({
      message: "Cleanup successful",
      deleted: result.rowCount
    });

  } catch (err) {
    console.error("❌ Cron error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
