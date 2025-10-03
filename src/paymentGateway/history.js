import express from "express";
import prisma from '../Prisma.client.js';

const router = express.Router();


// Fetch all payment history (paginated)
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const total = await prisma.paymentHist.count();

    const data = await prisma.paymentHist.findMany({
      orderBy: { paid_on: "desc" },
      skip: offset,
      take: limit,
    });

    res.json({
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("Error fetching payment history", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Fetch individual user's payment history (paginated)
router.get("/user", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const userId = req.user.id;

  try {
    const total = await prisma.paymentHist.count({
      where: { id: userId },
    });

    const data = await prisma.paymentHist.findMany({
      where: { id: userId },
      orderBy: { paid_on: "desc" },
      skip: offset,
      take: limit,
    });

    res.json({
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("Error fetching user payment history", err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;