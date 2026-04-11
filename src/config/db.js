const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ebocab",
  port: 5432
});

// test connection on startup
pool.connect()
  .then(client => {
    console.log("✅ PostgreSQL Connected Successfully");
    client.release();
  })
  .catch(err => {
    console.error("❌ PostgreSQL Connection Error:", err.message);
  });

module.exports = pool;
