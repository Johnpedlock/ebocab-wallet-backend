const walletService = require("../services/walletService");

exports.topUpWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const reference = "TXN_" + Date.now();

    const result = await walletService.creditWallet(
      userId,
      amount,
      reference
    );

    res.json({
      message: "Wallet funded",
      data: result
    });

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};
