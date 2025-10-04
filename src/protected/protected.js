import express from "express";
import { isAdmin } from "../auth/middleware.js";
import prisma from '../Prisma.client.js';

const router = express.Router();


    router.get("/", async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    const user = await prisma.users.findFirst({
      where: { d_id: userId },
      select: { isban: true }
    });

    if (!user || user.isban === "true") {  // if isban is string
      console.log("Unauthorized, Banned User");
      return res.status(401).json({ message: "UB" });
    }

    res.status(200).json({ message: "Authorized" });
  } catch (err) {
    console.error("Error checking user ban status:", err.message);
    return res.status(500).json({ message: "Server unavailable" });
  }
});

// Protected Route for admin
router.get("/admin/route", isAdmin, (req, res) => {
  res.status(200).json({ message: "Admin Authorized" });
});

export default router;