import express from "express";
import prisma from '../Prisma.client.js';

const router = express.Router();



// db.execute(`INSERT INTO networks(name) VALUES('MTN')`, (err, result) => {
//   if (err) throw err;
//   console.log("yes")
// });


// Fetch data network
router.get("/", async (req, res) => {
  try {
    const networks = await prisma.networks.findMany({
      where: { is_active: "active" }
    });

    res.status(200).json(networks);
  } catch (err) {
    console.error("Failed to fetch networks:", err);
    res.status(500).json({ message: "Server unavailable" });
  }
});

export default router;