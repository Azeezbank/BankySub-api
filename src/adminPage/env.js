import express from 'express';
import { encrypt, decrypt } from '../uttilis/encrypt.js';
import dotenv from 'dotenv';
import prisma from '../Prisma.client.js';
dotenv.config();

const router = express.Router();


// Update API docs
router.post("/", async (req, res) => {
  const { service_type, api_key, api_url } = req.body;

  try {
    const encryptedApiKey = encrypt(api_key);

    // Use upsert to either create or update
    await prisma.env.upsert({
      where: { service_type }, // service_type must be unique in Prisma schema.
      update: {
        api_key: encryptedApiKey,
        api_url,
      },
      create: {
        service_type,
        api_key: encryptedApiKey,
        api_url,
      },
    });

    return res.status(200).json({ message: "API details saved successfully" });
  } catch (err) {
    console.error("Failed to save API docs", err);
    return res.status(500).json({ message: "Failed to save API docs" });
  }
});

// Fetch API Docs
router.get("/", async (req, res) => {
  try {
    const docs = await prisma.env.findMany({
      select: {
        d_id: true,
        service_type: true,
        api_key: true,
        api_url: true,
      },
    });

    // decrypt keys
    const decryptedDocs = docs.map((doc) => ({
      ...doc,
      api_key: decrypt(doc.api_key),
    }));

    res.status(200).json(decryptedDocs);
  } catch (err) {
    console.error("Failed to fetch API docs", err);
    return res.status(500).json({ message: "Failed to fetch API docs" });
  }
});

export default router;