import express from "express";
import db from '../config/database.js';

const router = express.Router();


// Admin webhook transaction history
// const sql = `CREATE TABLE IF NOT EXISTS transactionWebHook(d_id INT AUTO_INCREMENT PRIMARY KEY,  webHook_response VARCHAR(800), create_date DATETIME)`;
// db.execute(sql, (err, result) => {
//   if (err) throw err;
//   console.log('admindTranaction table created successfully');
// });


//Webhook transaction histories
router.post("/webhook/histories", async (req, res) => {
  const payload = req.body;
  const sql = `INSERT INTO transactionWebHook(webHook_response) VALUES(?)`;
  db.execute(sql, [payload], (err, results) => {
    if (err) {
      console.log("Failed to insert webhool transaction details");
      return res
        .status(500)
        .json({ message: "Failed to insert webhook transaction details" });
    }
    res
      .status(200)
      .json({
        message: "Webhook transaction details has been successfully inserted",
      });
  });
});

export default router;