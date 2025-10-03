import express from "express";
import prisma from '../Prisma.client.js';

const router = express.Router();


//Webhook transaction histories
router.post("/webhook/histories", async (req, res) => {
  try {
    const payload = req.body;

    await prisma.transactionWebHook.create({
      data: {
        webHook_response: payload, // if column is JSON type in Prisma schema
      },
    });

    res.status(200).json({
      message: "Webhook transaction details has been successfully inserted",
    });
  } catch (err) {
    console.error("Failed to insert webhook transaction details", err.message);
    res.status(500).json({
      message: "Failed to insert webhook transaction details",
    });
  }
});

export default router;