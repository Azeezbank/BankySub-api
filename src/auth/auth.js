import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import transporter from "../config/mailer.js";
import prisma from '../Prisma.client.js';
import JWT from "jsonwebtoken";

const router = express.Router();
dotenv.config();



//Route to register user
router.post("/register", async (req, res) => {
  const { password, username, email, phone, fullName, referralUsername } = req.body;
  try {
      const user = await prisma.users.findFirst({ where: {
        OR: [
          {user_email: email }, {username: username}
        ]
      }});

      if (!user) {
        return res.status(400).json({ message: "User already exists" });
      }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            await prisma.users.create({ data: {
              user_pass: hashedPassword, username: username, user_email: email, Phone_number: phone, verificationOTP: verificationCode, fullName: fullName, referral: referralUsername}
            });

            // Send email
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Verify your email",
              html: `<p>Your verification code is <b>${verificationCode}</b></p>`,
            });

            return res.status(200).json({ message: "User registered successfully, verification code has been sent to your mail" });
      } catch (hashError) {
        console.error("Error registering user", hashError);
        return res.status(500).json({ message: "Error processing request" });
      }
    }
  );

// Verify user mail
router.post("/verify/mail", async (req, res) => {
  const { otp } = req.body;

  try {
    // Find user with matching OTP
    const user = await prisma.users.findFirst({
      where: { verificationOTP: otp },
      select: { username: true, referral: true, verificationOTP: true },
    });

    if (!user || user.verificationOTP !== otp) {
      return res.status(404).json({
        message:
          "Invalid Verification Code, Please input valid verification code",
      });
    }

    const { username, referral } = user;

    // Update user to verified
    await prisma.users.update({
      where: { verificationOTP: otp },
      data: { isverified: "true" },
    });

    // Check referral
    const isReferral = await prisma.users.findFirst({
      where: { referral: referral },
    });

    if (isReferral) {
      await prisma.users.update({
        where: { username: referral.trim() },
        data: { referree: { increment: 1 } },
      });
    } else {
      console.log("No referral found");
    }

    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "tunstelecom.com.ng@gmail.com",
      subject: "New User Registered",
      html: `<p>New User with Username <b>${username}</b> has just registered on your website </p>`,
    });

    return res.status(200).json({ message: "User Verified Successfully" });
  } catch (err) {
    console.error("Error verifying user mail", err.message);
    return res.status(500).json({ message: "Error verifying user mail" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If not verified
    if (user.isverified === "false") {
      const email = user.user_email;
      const verificationCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // Send verification email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        html: `<p>Your verification code is <b>${verificationCode}</b></p>`,
      });

      // Update OTP
      await prisma.users.update({
        where: { username },
        data: { verificationOTP: verificationCode },
      });

      return res.status(503).json({
        message:
          "User mail not verified, please verify your mail. An OTP has been sent to your mail.",
      });
    }

    // Check password
    const passwordIsValid = bcrypt.compareSync(password, user.user_pass);
    if (!passwordIsValid) {
      return res.status(401).json({
        message:
          "Please enter a correct username and password. Note that both fields may be case-sensitive",
      });
    }

    // Generate JWT
    const token = JWT.sign({ id: user.d_id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error", err.message);
    return res.status(500).json({ message: "Login failed" });
  }
});


export default router;