import express from "express";
import db from '../../config/database.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();
const router = express.Router();

//Payment transaction table
// const sql2 = `CREATE TABLE IF NOT EXISTS paymentHist(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, event_type VARCHAR(100), payment_ref VARCHAR(255), paid_on DATETIME, amount DECIMAL(10, 2) DEFAULT 0.00, payment_method VARCHAR(255), payment_status VARCHAR(50), prev_balance DECIMAL(10, 2) DEFAULT 0.00, user_balance DECIMAL(10, 2) DEFAULT 0.00)`;
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
  const amountPaid = parseFloat(payload.eventData.amountPaid);
  const paymentMethod = payload.eventData.paymentMethod;
  const paymentStatus = payload.eventData.paymentStatus;
  const userid = reference.split('_')[1];

  const chargesPercent = 2;
  const charges = (chargesPercent / 100) * amountPaid;
  const netAmount = amountPaid - charges;

  try {
    db.query(
      `SELECT user_balance, isFund, referral FROM users WHERE d_id = ?`,
      [userid],
      (err, result) => {
        if (err || result.length === 0) {
          return res
            .status(500)
            .json({ message: "Failed to select user balance" });
        }

        const prevBalance = parseFloat(result[0].user_balance);
        const newBalance = prevBalance + netAmount;
        const { isFund, referral } = result[0];


        const sql = `INSERT INTO paymentHist(id, event_type, payment_ref, paid_on, amount, payment_method, payment_status, prev_balance, user_balance) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.execute(
          sql,
          [
            userid,
            eventType,
            paymentRef,
            paidOn,
            netAmount,
            paymentMethod,
            paymentStatus,
            prevBalance,
            newBalance,
          ],
          (err, payhist) => {
            if (err) {
              console.error("Failed to insert payment history", err);
              return res
                .status(500)
                .json({ message: "Failed to insert payment history" });
            }

            db.execute(
              `UPDATE users SET user_balance = ?, prev_balance = ? WHERE d_id = ?`,
              [newBalance, prevBalance, userid],
              async (err, result) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ message: "Failed to update user balance" });
                }

                //Calculate the referral % amount
                const referralPercentage = 2;
                const referralBonus = (referralPercentage / 100) * netAmount;

                if (isFund === 'false') {
                  const refer = await prisma.users.findUnique({ where: { username: referral } });
                  if (!refer) {
                    console.log('No referral found');
                  } else if (refer.username === referral) {
                    console.log('You cant refer yourself');
                  } else {
                    await prisma.users.update({
                      where: { username: referral },
                      data: {
                        cashback: { increment: referralBonus },
                        isFund: 'true'
                      }
                    });
                  }
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
