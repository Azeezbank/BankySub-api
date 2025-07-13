import express from "express";
import { isAdmin } from "../auth/middleware.js";
import db from '../config/database.js';

const router = express.Router();

//Protected route
router.get("/", (req, res) => {
  const userId = req.user.id;
  const sql = `SELECT isban FROM users WHERE d_id = ?`;
  db.query(sql, [userId], (err, result) => {
    if (err || result[0].isban === 'true') {
      console.log('Unauthorized, Banned User', err.message);
      return res.status(401).json({ message: 'UB' });
    }

    res.status(200).json({ message: "Authorized" });
  });
});

//Protected Route for admin
router.get('/admin/route', isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin Authorized' });
});

export default router;