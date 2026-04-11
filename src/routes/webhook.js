const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= SELAR WEBHOOK =================
// This will be called after successful payment
router.post("/selar", async (req, res) => {
  try {
    const { userId, amount, status } = req.body;

    console.log("📩 Webhook received:", req.body);

    if (status !== "success") {
      return res.json({ message: "Payment not successful" });
    }

    const result = await db.query(
      `UPDATE wallet 
       SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.json({
      message: "Wallet funded successfully",
      wallet: result.rows[0],
    });

  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
});

module.exports = router;
