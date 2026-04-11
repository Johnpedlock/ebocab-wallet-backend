const db = require("./config/db");

(async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("✅ DB CONNECTED:", res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("❌ DB ERROR:", err);
    process.exit(1);
  }
})();
