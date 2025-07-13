import express from "express";
import db from '../config/database.js';
const router = express.Router();

// db.execute(`CREATE TABLE IF NOT EXISTS networks(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//     if (err) throw err;
//     console.log("Table networks created");
// });

// db.execute(`INSERT INTO networks(name) VALUES('MTN')`, (err, result) => {
//   if (err) throw err;
//   console.log("yes")
// });


//Fetch data network
router.get("/", (req, res) => {
  const sql = `SELECT * FROM networks WHERE is_active = 'active'`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server unavailable" });
    }
    res.status(200).json(result);
  });
});

export default router;