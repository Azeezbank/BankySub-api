import express from "express";
import db from '../../config/database.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();
const router = express.Router();

//Payment transaction table
// const sql2 = `CREATE TABLE IF NOT EXISTS paymentHist(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, event_type VARCHAR(100), payment_ref VARCHAR(255), paid_on DATETIME, amount INT, payment_method VARCHAR(255), payment_status VARCHAR(50), prev_balance INT, user_balance INT)`;
// db.execute(sql2, (err, result) => {
//   if (err) {
//     console.error(err);
//   }
//   console.log("paymentHist table created");
// });


//Payment webhook
router.post("/", async (req, res) => {
  const payload = req.body;

  // Step 1: Verify the request signature
  const verifySignature = (payload, signature) => {
    const secretKey = process.env.MON_SECRET_KEY;
    const computedHash = crypto
      .createHmac("sha512", secretKey)
      .update(JSON.stringify(payload))
      .digest("hex");
    return computedHash === signature;
  };

  const monnifySignature = req.headers["monnify-signature"];
  if (!monnifySignature || !verifySignature(payload, monnifySignature)) {
    console.error("Invalid Monnify signature");
    return res.status(403).json({ message: "Unauthorized request" });
  }

  const eventType = payload.eventType;
  const reference = payload.eventData.product.reference;
  const paymentRef = payload.eventData.paymentReference;
  const paidOn = payload.eventData.paidOn;
  const amountPaid = payload.eventData.amountPaid;
  const paymentMethod = payload.eventData.paymentMethod;
  const paymentStatus = payload.eventData.paymentStatus;

  const chargesPercent = 2;
  const charges = (chargesPercent / 100) * amountPaid;
  const netAmount = amountPaid - charges;

  try {
    db.query(
      `SELECT user_balance FROM users WHERE d_id = ?`,
      [reference],
      (err, result) => {
        if (err || result.length === 0) {
          return res
            .status(500)
            .json({ message: "Failed to select user balance" });
        }

        const prevBalance = result[0].user_balance;
        const newBalance = prevBalance + netAmount;

        const sql = `INSERT INTO paymentHist(id, event_type, payment_ref, paid_on, amount, payment_method, payment_status, prev_balance, user_balance) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.execute(
          sql,
          [
            reference,
            eventType,
            paymentRef,
            paidOn,
            netAmount,
            paymentMethod,
            paymentStatus,
            prevBalance,
            newBalance,
          ],
          (err, result) => {
            if (err) {
              console.error("Failed to insert payment history", err);
              return res
                .status(500)
                .json({ message: "Failed to insert payment history" });
            }

            db.execute(
              `UPDATE users SET user_balance = ?, prev_balance = ? WHERE d_id = ?`,
              [newBalance, prevBalance, reference],
              (err, result) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ message: "Failed to update user balance" });
                }
                res
                  .status(200)
                  .json({ message: "Webhook proccessed successfully" });
              }
            );
          }
        );
      }
    );
    // }
    //)
  } catch (err) {
    console.error("Error inserting payment:", err);
  }
});


export default router;