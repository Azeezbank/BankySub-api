import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import db from '../config/database.js';

dotenv.config();

//Middleware to protect routes
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("Unauthorized");
    return res.status(401).json({ message: "unauthorized" });
  }

  JWT.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "invalid token" });
    }

    req.user = user;
    next();
  });
};


//Check if a user is admin
export const isAdmin = (req, res, next) => {
  const userId = req.user.id;
  const sql = `SELECT role FROM users WHERE d_id = ?`
  db.query(sql, [userId], (err, result) => {
    if (err || result.length === 0) {
      console.log('Failed to select user', err.message);
      return res.status(400).json({ message: 'Failed to select user' });
    }

    if (result[0].role !== 'admin') {
      console.log('Access denied, Admin Only', err.message);
      return res.status(403).json({ message: 'Access denied, Admin Only' });
    }

    next();
  });
};
