import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

//Logout route
router.post("/", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "logout successfully" });
});

export default router;