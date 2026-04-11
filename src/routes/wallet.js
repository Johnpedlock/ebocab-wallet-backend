const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= HELPER =================
const toNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};

// ================= CREATE WALLET =================
router.post("/create", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    const existing = await db.query(
      "SELECT * FROM wallet WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        message: "Wallet already exists",
        data: existing.rows[0],
      });
    }

    const result = await db.query(
      "INSERT INTO wallet (user_id) VALUES ($1) RETURNING *",
      [userId]
    );

    return res.json({
      success: true,
      message: "Wallet created successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("CREATE WALLET ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ================= GET BALANCE =================
router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      "SELECT balance FROM wallet WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    return res.json({
      success: true,
      balance: result.rows[0].balance,
    });

  } catch (err) {
    console.error("BALANCE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch balance",
    });
  }
});

// ================= TOPUP INITIATE =================
// IMPORTANT: NO MONEY IS CREDITED HERE
router.post("/topup", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const validAmount = toNumber(amount);

    if (!userId || !validAmount) {
      return res.status(400).json({
        success: false,
        error: "userId and valid amount are required",
      });
    }

    return res.json({
      success: true,
      message: "Proceed to payment",
      data: {
        userId,
        amount: validAmount,
        payment_link: "https://selar.com/showlove/ebo-cab",
        whatsapp: "https://wa.me/2348106990302",
      },
    });

  } catch (err) {
    console.error("TOPUP ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Topup failed",
    });
  }
});

// ================= CREDIT WALLET (WEBHOOK / ADMIN ONLY) =================
router.post("/credit", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const validAmount = toNumber(amount);

    if (!userId || !validAmount || validAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid userId and positive amount required",
      });
    }

    const result = await db.query(
      `UPDATE wallet
       SET balance = balance + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [validAmount, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    return res.json({
      success: true,
      message: "Wallet credited successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("CREDIT ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Credit failed",
    });
  }
});

module.exports = router;
