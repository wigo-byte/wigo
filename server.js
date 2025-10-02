const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const PORT = 3000;

// 🟢 الاتصال بقاعدة MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to MySQL Railway Database");
  }
});

// 🟢 ميدل وير
app.use(cors());
app.use(bodyParser.json());

// ✅ إنشاء جدول مستخدمين إذا مش موجود
db.query(
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    earnings DECIMAL(10,2) DEFAULT 0,
    wallet VARCHAR(255) DEFAULT ''
  )`,
  (err) => {
    if (err) console.error("❌ Error creating users table:", err);
    else console.log("✅ Users table ready");
  }
);

// ✅ API: تسجيل مستخدم جديد
app.post("/api/register", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "❌ Username is required" });

  const sql = "INSERT INTO users (username) VALUES (?)";
  db.query(sql, [username], (err, result) => {
    if (err) return res.status(400).json({ error: "❌ Username already exists" });
    res.json({ message: "✅ User registered successfully", userId: result.insertId });
  });
});

// ✅ API: جلب بيانات مستخدم
app.get("/api/user/:username", (req, res) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [req.params.username], (err, results) => {
    if (err) return res.status(500).json({ error: "❌ Failed to fetch user" });
    if (results.length === 0) return res.status(404).json({ error: "❌ User not found" });
    res.json(results[0]);
  });
});

// ✅ API: رصيد تجريبي
app.get("/api/balance", (req, res) => {
  res.json({ balance: "100.50 USDT" });
});

// ✅ API: عنوان إيداع ثابت
app.get("/api/deposit-address", (req, res) => {
  res.json({
    bep20: "0xddf9081aafafaf97eca88ca7de809a64d96153a2",
  });
});

// ✅ API: طلب سحب
app.post("/api/withdraw", (req, res) => {
  const { amount, address } = req.body;
  console.log("💸 طلب سحب جديد:", { amount, address });
  res.json({ status: "✅ تم استلام طلب السحب وسيتم تنفيذه يدوياً" });
});

// ✅ تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});