import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../../Prisma.client.js';
dotenv.config();
const router = express.Router();



const { MON_API_KEY, MON_SECRET_KEY, MON_CONTRACT_CODE, MON_BASE_URL } =
  process.env;
const credentials = Buffer.from(`${MON_API_KEY}:${MON_SECRET_KEY}`).toString(
  "base64"
);

const authenticate = async () => {
  const response = await axios.post(
    `${MON_BASE_URL}/api/v1/auth/login`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.responseBody.accessToken;
};


// Payment connection - Create dedicated account number
router.post("/dedicated/account", async (req, res) => {
  const userId = req.user.id;

  try {
    const token = await authenticate();
    const randomRef = Math.floor(1000 + Math.random() * 9000);

    // Fetch user details
    const userDetail = await prisma.users.findUnique({
      where: { d_id: userId },
      select: { username: true, user_email: true, nin: true },
    });

    if (!userDetail) {
      console.log("Unable to select user details");
      return res.status(500).json({ message: "Unable to select user details" });
    }

    if (!userDetail.nin || userDetail.nin.length < 11) {
      console.log("Invalid NIN Number");
      return res
        .status(400)
        .json({ message: "NIN cannot be empty, submit your NIN" });
    }

    // Call Monnify API
    const response = await axios.post(
      `${MON_BASE_URL}/api/v1/bank-transfer/reserved-accounts`,
      {
        accountReference: `${randomRef}_${userId}`,
        accountName: userDetail.username,
        currencyCode: "NGN",
        contractCode: MON_CONTRACT_CODE,
        customerEmail: userDetail.user_email,
        nin: userDetail.nin,
        customerName: userDetail.username,
        getAllAvailableBanks: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const acctNo = response.data.responseBody.accountNumber;
    const acctName = response.data.responseBody.accountName;
    const bankName = response.data.responseBody.bankName;
    const reference = response.data.responseBody.accountReference;

    // Insert into DB with Prisma
    await prisma.userBankDetails1.create({
      data: {
        id: userId,
        acctNo,
        acctName,
        bankName,
        acct_id: reference,
      },
    });

    console.log("Bank details inserted");
    return res.status(200).json(response.data);
  } catch (err) {
    console.error(err.response?.data || err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;