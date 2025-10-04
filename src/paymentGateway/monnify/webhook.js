import express from "express";
import dotenv from 'dotenv';
import crypto from 'crypto';
import prisma from '../../Prisma.client.js';

dotenv.config();
const router = express.Router();


// Payment webhook
router.post("/", async (req, res) => {
  const payload = req.body;

  // Step 1: Verify the request signature
  const verifySignature = (payload, signature) => {
    const secretKey = process.env.MON_SECRET_KEY;
    const computedHash = crypto
      .createHmac("sha512", secretKey)
      .update(JSON.stringify(payload))
      .digest("hex");
    return computedHash === signature;
  };

  const monnifySignature = req.headers["monnify-signature"];
  if (!monnifySignature || !verifySignature(payload, monnifySignature)) {
    console.error("Invalid Monnify signature");
    return res.status(403).json({ message: "Unauthorized request" });
  }

  const eventType = payload.eventType;
  const reference = payload.eventData.product.reference;
  const paymentRef = payload.eventData.paymentReference;
  const paidOn = payload.eventData.paidOn;
  const amountPaid = parseFloat(payload.eventData.amountPaid);
  const paymentMethod = payload.eventData.paymentMethod;
  const paymentStatus = payload.eventData.paymentStatus;
  const userId = parseInt(reference.split("_")[1]);

  const chargesPercent = 2;
  const charges = (chargesPercent / 100) * amountPaid;
  const netAmount = amountPaid - charges;

  try {
    // Step 2: Ensure payment not processed before
    const paymentExists = await prisma.paymentHist.findFirst({
      where: { payment_ref: paymentRef },
    });
    if (paymentExists) {
      return res.status(200).json({ message: "Payment already processed" });
    }

    // Step 3: Get user details
    const user = await prisma.users.findUnique({
      where: { d_id: userId },
      select: { user_balance: true, isFund: true, referral: true },
    });

    if (!user) {
      return res.status(500).json({ message: "Failed to select user balance" });
    }

    const prevBalance = parseFloat(user.user_balance);
    const newBalance = prevBalance + netAmount;
    const { isFund, referral } = user;

    // Step 4: Insert into payment history
    await prisma.paymentHist.create({
      data: {
        id: userId,
        event_type: eventType,
        payment_ref: paymentRef,
        paid_on: paidOn,
        amount: netAmount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        prev_balance: prevBalance,
        user_balance: newBalance,
      },
    });

    // Step 5: Update user balance
    await prisma.users.update({
      where: { d_id: userId },
      data: { user_balance: newBalance, prev_balance: prevBalance },
    });

    // Step 6: Handle referral bonus
    const referralPercentage = 2;
    const referralBonus = (referralPercentage / 100) * netAmount;

    if (isFund === "false" && referral) {
      const refer = await prisma.users.findFirst({
        where: { username: referral },
      });

      if (!refer) {
        console.log("No referral found");
      } else if (refer.username === referral && refer.d_id === userId) {
        console.log("You can't refer yourself");
      } else {
        await prisma.users.update({
          where: { username: referral },
          data: {
            cashback: { increment: referralBonus },
            isFund: "true",
          },
        });
      }
    }

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("Error inserting payment:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
