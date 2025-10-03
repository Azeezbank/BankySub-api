import express from "express";
import dotenv from 'dotenv';
import prisma from '../Prisma.client.js';
dotenv.config();
const router = express.Router();

// Update setting details
router.put("/details/updated/setting", async (req, res) => {
  const { whatsapp_phone, whatsapp_number, whatsapp_link, dash_message } = req.body;

  try {
    // check if admin_setting exists (assuming only one row is maintained)
    const existingSetting = await prisma.admin_setting.findFirst();

    if (existingSetting) {
      // update the record
      await prisma.admin_setting.update({
        where: { d_id: existingSetting.d_id },
        data: {
          whatsapp_phone,
          whatsapp_number,
          whatsapp_link,
          dash_message,
        },
      });
      return res.status(200).json({ message: "User details updated" });
    } else {
      // insert new record
      await prisma.admin_setting.create({
        data: {
          whatsapp_phone,
          whatsapp_number,
          whatsapp_link,
          dash_message,
        },
      });
      return res.status(200).json({ message: "User details inserted" });
    }
  } catch (err) {
    console.error("Error handling admin details", err);
    return res.status(500).json({ message: "Error handling admin details" });
  }
});


// Fetch admin setting details
router.get("/details", async (req, res) => {
  try {
    const details = await prisma.admin_setting.findFirst({
      select: {
        whatsapp_phone: true,
        whatsapp_number: true,
        whatsapp_link: true,
        dash_message: true,
      },
    });

    if (!details) {
      return res.status(404).json({ message: "No admin details found" });
    }

    res.status(200).json(details);
  } catch (err) {
    console.error("Failed to fetch admin details", err);
    return res.status(500).json({ message: "Failed to fetch admin details" });
  }
});


//Fetch dashbord message
router.get("/dashboard/message", async (req, res) => {
  try {
    const message = await prisma.admin_setting.findFirst({
      select: { whatsapp_link: true, dash_message: true }
    });

    if (!message) {
      return res.status(404).json({ message: "Error fetching dashboard message" });
    }

    res.status(200).json(message);
  } catch (err) {
    console.error("Error fetching dashboard message:", err);
    res.status(500).json({ message: "Server error while fetching dashboard message" });
  }
});

export default router;