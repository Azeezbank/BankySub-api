import express from "express";
import db from '../config/database.js';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
dotenv.config();
const router = express.Router();
const prisma = new PrismaClient();

//setting details table
// const sql = `CREATE TABLE IF NOT EXISTS admin_setting(d_id INT PRIMARY KEY AUTO_INCREMENT, whatsapp_phone VARCHAR(15), whatsapp_number VARCHAR(255), whatsapp_link VARCHAR(255), dash_message TEXT)`;
// db.execute(sql, (err, result) => {
//   if (err) throw err;
//   console.log('admin setting table created')
// });

// Update setting details
router.put("/details/updated/setting", async (req, res) => {
  const { whatsapp_phone, whatsapp_number, whatsapp_link, dash_message } = req.body;
  db.query(`SELECT d_id FROM admin_setting`, (err, result) => {
    if (err) {
      console.log("Error fetching admin details", err);
      return res.status(500).json({ message: "Error fetching admin details" });
    }

    if (result.length > 0) {
      const userId = result[0].d_id;
      db.execute(
        `UPDATE admin_setting SET whatsapp_phone = ?, whatsapp_number = ?, whatsapp_link = ?, dash_message = ? WHERE d_id = ?`,
        [whatsapp_phone, whatsapp_number, whatsapp_link, dash_message, userId],
        (err, result) => {
          if (err) {
            console.log("Error updating admin details", err);
            return res
              .status(500)
              .json({ message: "Error updating admin details" });
          }
          res.status(200).json({ message: "User details updated" });
        }
      );
    } else {
      db.execute(
        `INSERT INTO admin_setting(whatsapp_phone, whatsapp_number, whatsapp_link, dash_message) VALUES(?, ?, ?)`,
        [whatsapp_phone, whatsapp_number, whatsapp_link, dash_message],
        (err, result) => {
          if (err) {
            console.log("Error inseting admin details", err);
            return res
              .status(500)
              .json({ message: "Error inserting admin details", err });
          }
          res.status(200).json({ message: "User details inserted" });
        }
      );
    }
  });
});


//Fetch admin setting details
router.get("/details", async (req, res) => {

  try {
    const details = await prisma.admin_setting.findMany({
      select: {
        whatsapp_phone: true, whatsapp_number: true, whatsapp_link: true, dash_message: true
      }
    });

    if (!details || details.length === 0) {
      return res.status(404).json({ message: "Error selecting admin details" });
    }

    res.status(200).json(details);
  } catch (err) {
    console.error('Failed to select setting detrails', err);
    return res.status(500).json({ message: 'Failed to select setting detrails' });
  }
});


//Fetch dashbord message
router.get("/dashboard/message", async (req, res) => {
  try {
    const message = await prisma.admin_setting.findFirst({
      select: { whatsapp_link: true, dash_message: true }
    });

    if (!message || message.length === 0) {
      return res.status(404).json({ message: "Error fetching dashboard message" });
    }

    res.status(200).json(message);
  } catch (err) {
    console.error("Error fetching dashboard message:", err);
    res.status(500).json({ message: "Server error while fetching dashboard message" });
  }
});

export default router;