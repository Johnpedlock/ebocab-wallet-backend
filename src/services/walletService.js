const db = require("../config/db");

// credit wallet safely
async function creditWallet(userId, amount, reference) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // check duplicate transaction
    const existing = await client.query(
      "SELECT * FROM transactions WHERE reference = $1",
      [reference]
    );

    if (existing.rows.length > 0) {
      throw new Error("Duplicate transaction");
    }

    // lock wallet row
    const walletRes = await client.query(
      "SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE",
      [userId]
    );

    if (walletRes.rows.length === 0) {
      throw new Error("Wallet not found");
    }

    const newBalance = parseFloat(walletRes.rows[0].balance) + parseFloat(amount);

    // update balance
    await client.query(
      "UPDATE wallets SET balance = $1 WHERE user_id = $2",
      [newBalance, userId]
    );

    // record transaction
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, reference, status)
       VALUES ($1, 'credit', $2, $3, 'success')`,
      [userId, amount, reference]
    );

    await client.query("COMMIT");

    return { success: true, balance: newBalance };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  creditWallet
};
