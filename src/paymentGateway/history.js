import express from "express";
import db from '../config/database.js';

const router = express.Router();

// fetch payment history
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM paymentHist";
  const dataQuery = "SELECT * FROM paymentHist ORDER BY paid_on DESC LIMIT ? OFFSET ?";

  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    const total = countResult[0].total;
    db.query(dataQuery, [limit, offset], (err, dataResult) => {
      if (err) return res.status(500).json({ message: "Server Error" });
      res.json({
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
        data: dataResult,
      });
    });
  });
});

export default router;