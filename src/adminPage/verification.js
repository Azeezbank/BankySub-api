import express from "express";
import dotenv from 'dotenv';
import db from '../config/database.js';

const router = express.Router();
dotenv.config();

//update user account verification
router.post("/verify/account", (req, res) => {
  const { verificationType, verificationNumber } = req.body;
  const userid = req.user.id;

  const allowedTypes = ["NIN", "BVN"];
  if (!allowedTypes.includes(verificationType)) {
    return res.status(400).json({ message: "Invalid verification type" });
  }

  if (verificationNumber.length !== 11)
    return res.status(400).json({ message: "Invalid NIN" });

  let type = verificationType.toLowerCase();


  const sql = `UPDATE users SET ${type} = ? WHERE d_id = ?`;
  db.execute(sql, [verificationNumber, userid], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Failed to verify user account" });
    }
    res.status(200).json({ message: "User Account Verified" });
  });
});

export default router;