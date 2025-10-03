import express from "express";
import dotenv from 'dotenv';
import prisma from '../Prisma.client.js';

const router = express.Router();
dotenv.config();


// Update user account verification
router.post("/verify/account", async (req, res) => {
  const { verificationType, verificationNumber } = req.body;
  const userId = req.user.id;

  try {
    const allowedTypes = ["NIN", "BVN"];
    if (!allowedTypes.includes(verificationType)) {
      return res.status(400).json({ message: "Invalid verification type" });
    }

    if (verificationNumber.length !== 11) {
      return res.status(400).json({ message: "Invalid NIN" });
    }

    const type = verificationType.toLowerCase(); // will be 'nin' or 'bvn'

    // Update using Prisma
    const updatedUser = await prisma.users.update({
      where: { d_id: userId },
      data: {
        [type]: verificationNumber, // dynamic field update
      },
    });

    return res.status(200).json({ message: "User Account Verified", user: updatedUser });
  } catch (err) {
    console.error("Failed to verify user account", err);
    return res.status(500).json({ message: "Failed to verify user account" });
  }
});

export default router;