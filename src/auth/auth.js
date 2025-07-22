import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import db from "../config/database.js";
import transporter from "../config/mailer.js";
import { Prisma, PrismaClient } from "@prisma/client";
import JWT from "jsonwebtoken";
const prisma = new PrismaClient();

const router = express.Router();
dotenv.config();



//Route to register user
router.post("/register", async (req, res) => {
  const { password, username, email, phone, fullName, referralUsername } = req.body;
console.log('working');
  db.query(
    `SELECT * FROM users WHERE user_email = ?`,
    [email],
    async (err, result) => {
      if (err) {
        console.error("Error checking user", err);
        return res.status(500).json({ message: "Error checking user" });
      }
      if (result.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const sql = `INSERT INTO users (user_pass, username, user_email, Phone_number, verificationOTP, fullName, referral) VALUES (?, ?, ?, ?, ?, ?, ?);`;

        db.query(
          sql,
          [hashedPassword, username, email, phone, verificationCode, fullName, referralUsername],
          async (err, result) => {
            if (err) {
              console.error("Error registering user", err);
              return res.status(401).json({ message: "Error inserting user" });
            }

            // Send email
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Verify your email",
              html: `<p>Your verification code is <b>${verificationCode}</b></p>`,
            });

            return res
              .status(200)
              .json({ message: "User registered successfully, verification code has been sent to your mail" });
          }
        );
      } catch (hashError) {
        console.error("Error hashing password", hashError);
        return res.status(500).json({ message: "Error processing request" });
      }
    }
  );
});


//Verify user mail
router.post('/verify/mail', (req, res) => {
  const { otp } = req.body;
  const sql = `SELECT verificationOTP, username, referral FROM users WHERE verificationOTP = ?`;
  db.query(sql, [otp], (err, result) => {
    if (err || result.length === 0 || result[0].verificationOTP !== otp) {
      console.error('Invalid Verification Code', err);
      return res.status(404).json({ message: 'Invalid Verification Code, Please input valid verification code' });
    }

    const { username, referral } = result[0];
    const totalReferree = (referree || 0) + 1;

    const sql2 = `UPDATE users SET isverified = 'true', WHERE verificationOTP = ?`;
    db.execute(sql2, [otp], async (err, updateUser) => {
      if (err) {
        console.error('Failed to verify user', err);
        return res.status(500).json({ message: 'Failed to verify user' });
      }
      
      await prisma.users.update({where: {username: referral }, data: {referree: totalReferree}});

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'tunstelecom.com.ng@gmail.com',
        subject: "New User Registered",
        html: `<p>New User with Username <b>${username}</b> has just registered on your website </p>`,
      });

      res.status(200).json({ message: 'User Verified Successfully' });
    });
  });
});

//user login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err || results.length === 0) {
        console.log("User not found", err);
        return res.status(404).json({ message: "User not found" });
      }
      const user = results[0];

      if (user.isverified === 'false') {
        console.log('User mail not verified, please verify your mail', err);
        const email = results[0].user_email;
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Send email
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify your email",
          html: `<p>Your verification code is <b>${verificationCode}</b></p>`,
        });

        const sql = `UPDATE users SET verificationOTP = ? WHERE username = ?`;
        db.execute(sql, [verificationCode, username], (err, updatedCode) => {
          if (err) {
            console.error('Failed to Update user verification code', err.message);
            return res.status(500).json({ message: 'Failed to Update user verification code' });
          }

          return res.status(503).json({ message: 'User mail not verified, please verify your mail. An OTP has been sent to your mail.' })
        });
        return;
      }

      const passwordIsValid = bcrypt.compareSync(password, user.user_pass);

      if (!passwordIsValid)
        return res.status(401).json({
          message:
            "Please enter a correct username and password. Note that both fields may be case-sensitive",
        });

      const token = JWT.sign({ id: user.d_id }, process.env.JWT_SECRET, {
        expiresIn: "10m",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/'
      });

      res.status(200).json({ message: "login successful" });
    }
  );
});


export default router;