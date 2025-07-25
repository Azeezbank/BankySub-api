import express from "express";
import dotenv from 'dotenv';
import db from '../config/database.js';
import axios from "axios";
import { decrypt } from "../uttilis/encrypt.js";
dotenv.config();
const router = express.Router();

//Airtime section
//Create Airtime network table
// const sql = `CREATE TABLE IF NOT EXISTS AirtimeN(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active', id INT)`;
// db.execute(sql, (err, result) => {
//   if (err) throw err;
//   console.log("Airtime network Table created");
// });

//Insert into Airtime network table
// db.query(`INSERT INTO AirtimeN(name, id) VALUES('MTN', 1), ('GLO', 2), ('AIRTEL', 4)`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
// });

//Create Airtime type table
// const AirtimeT = `CREATE TABLE IF NOT EXISTS AirtimeT(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active')`;
// db.execute(AirtimeT, (err, result) => {
//   if (err) throw err;
//   console.log("Airtime Type Table created");
// });

//Create Airtime history table
// db.execute(`CREATE TABLE IF NOT EXISTS airtimeHist(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, network VARCHAR(15), amount VARCHAR(15), phone_number VARCHAR(20), previous_balance VARCHAR(15), new_balance VARCHAR(15), time DATETIME, status VARCHAR(15)), airtimeType VARCHAR(20)`, (err, res) => {
//   if (err) throw err;
//   console.log('airtime record table created')
// });

// db.execute(`ALTER TABLE airtimeHist ADD airtimeType VARCHAR(20)`, (err, result) => {
//   if (err) throw err;
//   console.log('aitime tyope added')
// });

//Insert into Airtime type table
// db.query(`INSERT INTO AirtimeT(name) VALUES('VTU')`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
// });


// Fetch Airtime network
router.get("/networkN", (req, res) => {
  const sql = `SELECT * FROM AirtimeN WHERE is_active = 'active'`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server unavailable" });
    }
    res.status(200).json(result);
  });
});

//Fetch Airtime type
router.get("/type", (req, res) => {
  const sql = `SELECT * FROM AirtimeT WHERE is_active = 'active'`;
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Unable to select Airtime type" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Airtime type not found" });
    }
    res.status(200).json(result);
  });
});

//Fetch Airtime from API
router.post("/topup", async (req, res) => {
  const { airtimeNChoosen, airtimeTChoosen, mobileN, amount, actualAmount } = req.body;
  const userid = req.user.id;

  const airtimeBody = {
    network: airtimeNChoosen,
    amount: actualAmount,
    mobile_number: mobileN,
    Ported_number: true,
    airtime_type: airtimeTChoosen,
  };

  try {
    db.query(`SELECT api_key, api_url FROM env WHERE service_type = ?`, [airtimeTChoosen], async (err, apiDoc) => {
      if (err) {
        console.error('Failed to select api details.', err.message);
        return;
      }

      if (!apiDoc || apiDoc.length === 0) {
      console.error("No API found for the given service type.");
      return;
    }

      const { api_key, api_url } = apiDoc[0];
      const decryptKey = decrypt(api_key);
  const headers = {
    Authorization: decryptKey,
    "Content-Type": "application/json",
  };

    const response = await axios.post(
      api_url,
      airtimeBody,
      { headers }
    );
    //Deduct payment
    db.execute(
      `SELECT user_balance FROM users WHERE d_id = ?`,
      [userid],
      (err, result) => {
        if (err || result.length === 0) {
          console.error("Error slecting user balance");
          return res
            .status(500)
            .json({ message: "Error slecting user balance" });
        }

        const wallet = result[0].user_balance;
        if (wallet < amount) {
          console.error("Insufficient wallet balance");
          return res
            .status(404)
            .json({ message: "Insufficient wallet balance" });
        }
        const newBalance = wallet - amount;
        const userId = req.user.id;

        if (amount > 3000) {
          console.log("Froud Alert, Amount > 3k");
          // Alert Admin of the transaction
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'tunstelecom.com.ng@gmail.com',
            subject: "Froud Alert!",
            html: `<p>A User with <b>ID: ${userId} </b>, is trying to purchase Airtime more than 3k </p>`
          });

          const isban = 'true';
          const ban = `UPDATE users SET isban = ? WHERE d_id = ?`;
          db.execute(ban, [isban, userId], (err, result) => {
            if (err) {
              console.error(`Faild to ban User with ID: ${userId}`, err.message);
              return res.status(503).json({ message: 'Forbidden' });
            } else {
              console.log(`User ID: ${userId} Banned`)
              return res.status(403).json({ message: 'Transaction cannot be processed' });
            }
          });
          return;
        }

        db.execute(
          `UPDATE users SET user_balance = ? WHERE d_id = ?`,
          [newBalance, userid],
          (err, result) => {
            if (err) {
              console.error("Failed to deduct user wallet for airtime");
              return res
                .status(500)
                .json({ message: "Failed to deduct user wallet for airtime" });
            }
            db.execute(
              `UPDATE users SET prev_balance = ? WHERE d_id = ?`,
              [wallet, userid],
              (err, result) => {
                if (err) {
                  console.error("Failed to set previoud balance");
                  return res
                    .status(500)
                    .json({ message: "Failed to set previoud balance" });
                }

                if (
                  response.data.status === "failed" ||
                  response.data.status === "Failed"
                ) {
                  db.execute(
                    `UPDATE users SET user_balance = ? WHERE d_id = ?`,
                    [wallet, userid],
                    async (err, result) => {
                      if (err) {
                        console.error("Failed to refund user");
                      }
                      console.log("User refunded");
                    }
                  );
                } else {
                  console.log("Transaction successful");
                }

                const status =
                  response.data.Status;

                const hist = `INSERT INTO airtimeHist(id, network, amount, phone_number, previous_balance, new_balance, time, status, airtimeType) VALUES(?, ?, ?, ?, ?, ?, NOW(), ?, ?)`;
                db.execute(
                  hist,
                  [
                    userid,
                    airtimeNChoosen,
                    amount,
                    mobileN,
                    wallet,
                    newBalance,
                    status,
                    airtimeTChoosen,
                  ],
                  (err, result) => {
                    if (err) {
                      console.log(
                        "Failed to insert airtime transaction history",
                        err.message
                      );
                      return res
                        .status(500)
                        .json({
                          message:
                            "Failed to insert airtime transaction history",
                        });
                    }

                    res.status(200).json(response.data);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch Airtime from external API" });
  }
});

// Fetch airtime transaction histories
router.get("/history", (req, res) => {
  const userid = req.user.id;
  const sql = `SELECT d_id, network, amount, phone_number, previous_balance, new_balance, status, airtimeType, time FROM airtimeHist WHERE id = ? ORDER BY time DESC`;
  db.query(sql, [userid], (err, result) => {
    if (err) {
      console.log("Failed to select airtime transaction history", err.message);
      return res
        .status(500)
        .jsom({ message: "Failed to select airtime transaction history" });
    }

    res.status(200).json(result);
  });
});


export default router;