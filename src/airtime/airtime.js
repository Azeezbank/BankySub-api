import express from "express";
import dotenv from 'dotenv';
import axios from "axios";
import { decrypt } from "../uttilis/encrypt.js";
import prisma from '../Prisma.client.js';
dotenv.config();
const router = express.Router();

//Insert into Airtime network table
// db.query(`INSERT INTO AirtimeN(name, id) VALUES('MTN', 1), ('GLO', 2), ('AIRTEL', 4)`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
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
router.get("/networkN", async (req, res) => {
  try {
    const networks = await prisma.airtimeN.findMany({
      where: { is_active: "active" },
    });

    if (!networks || networks.length === 0) {
      return res.status(404).json({ message: "No active Airtime networks found" });
    }

    res.status(200).json(networks);
  } catch (err) {
    console.error("Failed to fetch Airtime networks", err);
    return res.status(500).json({ message: "Server unavailable" });
  }
});

// Fetch Airtime type
router.get("/type", async (req, res) => {
  try {
    const types = await prisma.airtimeT.findMany({
      where: { is_active: "active" },
    });

    if (!types || types.length === 0) {
      return res.status(404).json({ error: "Airtime type not found" });
    }

    res.status(200).json(types);
  } catch (err) {
    console.error("Failed to fetch Airtime types", err);
    return res.status(500).json({ error: "Unable to select Airtime type" });
  }
});


// Fetch Airtime from API
router.post("/topup", async (req, res) => {
  const { airtimeNChoosen, airtimeTChoosen, mobileN, amount, actualAmount } = req.body;
  const userId = req.user.id;

  const airtimeBody = {
    network: airtimeNChoosen,
    amount: actualAmount,
    mobile_number: mobileN,
    Ported_number: true,
    airtime_type: airtimeTChoosen,
  };

  try {
    // 1. Get API details
    const apiDoc = await prisma.env.findUnique({
      where: { service_type: airtimeTChoosen },
      select: { api_key: true, api_url: true },
    });

    if (!apiDoc) {
      return res.status(404).json({ message: "No API found for the given service type" });
    }

    const decryptKey = decrypt(apiDoc.api_key);
    const headers = {
      Authorization: decryptKey,
      "Content-Type": "application/json",
    };

    // 2. Get user balance
    const user = await prisma.users.findUnique({
      where: { d_id: userId },
      select: { user_balance: true, isban: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wallet = parseFloat(user.user_balance.toString());
    if (wallet < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // 3. Fraud check
    if (parseFloat(amount) > 3000) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "tunstelecom.com.ng@gmail.com",
        subject: "Fraud Alert!",
        html: `<p>A User with <b>ID: ${userId}</b> is trying to purchase Airtime more than 3k</p>`,
      });

      await prisma.users.update({
        where: { d_id: userId },
        data: { isban: "true" },
      });

      return res.status(403).json({ message: "Transaction cannot be processed" });
    }

    // 4. Deduct balance
    const newBalance = wallet - parseFloat(amount);
    await prisma.users.update({
      where: { d_id: userId },
      data: {
        user_balance: newBalance,
        prev_balance: wallet,
      },
    });

    let status = "failed";
    let apiResponse = null;

    // 5. Call external Airtime API
    try {
      const response = await axios.post(apiDoc.api_url, airtimeBody, { headers });
      apiResponse = response.data;
      status = response.data.status ?? response.data.Status ?? "unknown";

      // 6. Refund on failure
      if (
        status === "failed" ||
        status === "Failed" ||
        status === "Fail" ||
        status === "fail" ||
        (typeof status === "number" && status >= 400)
      ) {
        await prisma.users.update({
          where: { d_id: userId },
          data: { user_balance: wallet },
        });
        console.log("User refunded due to failed transaction");
      } else {
        console.log("Transaction successful");
      }
    } catch (error) {
      console.error("API request failed:", error.message);

      // Refund if API request itself fails
      await prisma.users.update({
        where: { d_id: userId },
        data: { user_balance: wallet },
      });

      status = "api_failed";
    }

    // 7. Insert history
    await prisma.airtimeHist.create({
      data: {
        id: userId,
        network: airtimeNChoosen,
        amount: parseFloat(amount),
        phone_number: mobileN,
        previous_balance: wallet,
        new_balance: newBalance,
        time: new Date(),
        status: status.toString(),
        airtimeType: airtimeTChoosen,
      },
    });

    if (status === "failed" || status === "api_failed") {
      return res.status(502).json({ message: "Transaction failed", status });
    }

    return res.status(200).json(apiResponse);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to process Airtime top-up" });
  }
});


// Fetch airtime transaction histories
router.get("/history", async (req, res) => {
  const userId = req.user.id;

  try {
    const histories = await prisma.airtimeHist.findMany({
      where: { id: userId },
      select: {
        d_id: true,
        network: true,
        amount: true,
        phone_number: true,
        previous_balance: true,
        new_balance: true,
        status: true,
        airtimeType: true,
        time: true,
      },
      orderBy: { time: "desc" },
    });

    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: "No airtime transaction history found" });
    }

    return res.status(200).json(histories);
  } catch (err) {
    console.error("Failed to select airtime transaction history", err.message);
    return res.status(500).json({ message: "Failed to select airtime transaction history" });
  }
});


export default router;