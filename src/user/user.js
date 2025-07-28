import express from 'express';
import db from '../config/database.js';

const router = express.Router();


//Create table users
// db.execute(
//   `CREATE TABLE IF NOT EXISTS users(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, username VARCHAR(20), user_pass VARCHAR(255), user_email VARCHAR(100), user_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP, prev_balance DECIMAL(10,2) DEFAULT 0.00, user_balance DECIMAL(10,2) DEFAULT 0.00, packages ENUM('USER', 'RESELLER', 'API') DEFAULT 'USER', Phone_number VARCHAR(15), Pin INT, role ENUM('admin', 'user') DEFAULT 'user', nin VARCHAR(11), verificationOTP VARCHAR(6), isverified ENUM('true', 'false') DEFAULT 'false', fullName VARCHAR(255), isban ENUM('true', 'false') DEFAULT 'false')`,
//   (err, result) => {
//     if (err) throw err;
//     console.log("Table networks created");
//   }
// );



// Fetch User Details
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM users";
  const sql = `SELECT d_id, username, user_email, user_balance, packages, Phone_number, Pin FROM users LIMIT ?, ?`;
  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    const total = countResult[0].total;

    db.query(sql, [offset, limit], (err, dataResult) => {
      if (err) {
        console.log("Error selecting user details", err.message);
        return res
          .status(500)
          .json({ message: "Error selecting user details" });
      }
      const totalPage = Math.ceil(total / limit);

      res.status(200).json({
        total,
        page,
        limit,
        totalPage,
        data: dataResult,
      });
    });
  });
});


//Select user details
router.get("/info", (req, res) => {
  const userid = req.user.id;
  const sql = `SELECT username, user_balance, role, packages, cashback, referree FROM users WHERE d_id = ?`;
  db.query(sql, [userid], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error selecting user" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(result);
  });
});

//Select user bank details
router.post("/bank/account", (req, res) => {
  const userid = req.user.id;
  const sql = `SELECT * FROM userBankDetails1 WHERE id = ? AND is_active = 'active'`;
  db.query(sql, [userid], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error selecting user bank details" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "No details found" });
    }
    res.status(200).json(result);
  });
});


//Fund user manually
router.post("/fund/:id", (req, res) => {
  const { amount } = req.body;
  const id = req.params.id;
  const event_type = "Manual Fund";
  const payment_ref = 'Admin Approved';
  const payment_method = "Manual";
  const payment_status = 'Approved';
  const paid_on = new Date().toISOString().replace('T', ' ').split('.')[0];

  if (!amount || isNaN(amount)) {
    console.log("Froud Funding");
    return res.status(400).json({ message: "Invalid amount" });
  }
  if (amount > 10000) {
    console.log("Funding amount exceeds limit");
    return res.status(400).json({ message: "Funding amount exceeds limit" });
  }
  // Select user balance
  db.query(`SELECT user_balance FROM users WHERE d_id = ?`, [id], (err, result) => {
    if (err || result.length === 0) {
      console.error("Error selecting user balance", err.message);
      return res.status(500).json({ message: "Error selecting user balance" });
    }

    const walletBalance = result[0].user_balance;

    const newBalance = walletBalance + amount;

    const sql = `INSERT INTO paymentHist(id, event_type, payment_ref, paid_on, amount, payment_method, payment_status, prev_balance, user_balance) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.execute(sql, [id, event_type, payment_ref, paid_on, amount, payment_method, payment_status, walletBalance, newBalance], (err, results) => {
      if (err) {
        console.error('Failed to insert funding record', err.message);
        return res.status(500).json({ message: 'Failed to insert funding recorf' });
      }

      // Update user balance
      const sql2 = `UPDATE users SET user_balance = ?, prev_balance = ? WHERE d_id = ?`;
      db.execute(sql2, [newBalance, walletBalance, id], (err, result) => {
        if (err) {
          console.error('Failed to update user balance', err.message);
          return res.status(500).json({ message: 'Failed to update user balance' });
        }
        res.status(200).json({ message: 'Wallet Funded Manually successfully' });
      });
    })
  });
});

//Select user details by id
router.get("/info/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT d_id, username, user_email, user_balance, packages, Phone_number, Pin, fullName FROM users WHERE d_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Failed to select user details', err.message);
      return res.status(500).json({ message: 'Failed to select user details' });
    }
    res.status(200).json(result[0])
  });
});

//updated user details
router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const { fieldName, value } = req.body;

  // Validate allowed fields
  const allowedFields = ['username', 'user_email', 'user_balance', 'packages', 'Phone_number', 'Pin', 'fullName'];
  if (!allowedFields.includes(fieldName)) {
    return res.status(400).json({ message: "Invalid field name" });
  }

  // Build dynamic field update safely
  const sql = `UPDATE users SET ${fieldName} = ? WHERE d_id = ?`;

  db.execute(sql, [value, id], (err, result) => {
    if (err) {
      console.error("Failed to update user details", err.message);
      return res.status(500).json({ message: "Failed to update user details" });
    }
    res.status(200).json({ message: "User details updated successfully" });
  });
});

//Ban user
router.put("/ban/:id", (req, res) => {
  const id = req.params.id;
  const ban = 'true';
  const sql = `UPDATE users SET isban = ? WHERE d_id = ?`;
  db.execute(sql, [ban, id], (err, result) => {
    if (err) {
      console.error('Failed to Ban user', err.message);
      return res.status(500).json({ message: 'Failed to Ban user' });
    }
  })
});

export default router;