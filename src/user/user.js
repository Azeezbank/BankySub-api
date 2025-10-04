import express from 'express';
import prisma from '../Prisma.client.js';
const router = express.Router();


// Fetch User Details
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.users.count();

    // Get paginated data
    const data = await prisma.users.findMany({
      skip,
      take: limit,
      select: {
        d_id: true,
        username: true,
        user_email: true,
        user_balance: true,
        packages: true,
        Phone_number: true,
        Pin: true,
      },
    });

    const totalPage = Math.ceil(total / limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPage,
      data,
    });
  } catch (err) {
    console.error("Error selecting user details", err.message);
    res.status(500).json({ message: "Error selecting user details" });
  }
});

// Select user details
router.get("/info", async (req, res) => {
  const userId = parseInt(req.user.id);

  try {
    const user = await prisma.users.findUnique({
      where: { d_id: userId },
      select: {
        username: true,
        user_balance: true,
        role: true,
        packages: true,
        cashback: true,
        referree: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error selecting user", err);
    res.status(500).json({ message: "Error selecting user" });
  }
});


// Update Pin
router.put("/pin", async (req, res) => {
  const pin = parseInt(req.body.pin);
  const userId = req.user.id;

  try {
    await prisma.users.update({
      where: { d_id: userId },
      data: { Pin: pin },
    });

    res.status(200).json({ message: "Pin updated successfully" });
  } catch (err) {
    console.error("Failed to update pin", err);
    res.status(500).json({ message: "Failed to update pin" });
  }
});


// Select user bank details
router.post("/bank/account", async (req, res) => {
  const userId = req.user.id;

  try {
    const bankDetails = await prisma.userBankDetails1.findFirst({
      where: {
        id: userId,
        is_active: "active",
      },
    });

    if (!bankDetails) {
      return res.status(404).json({ message: "No details found" });
    }

    res.status(200).json(bankDetails);
  } catch (err) {
    console.error("Error selecting user bank details", err);
    res.status(500).json({ message: "Error selecting user bank details" });
  }
});


// Fund user manually
router.post("/fund/:id", async (req, res) => {
  const amount = parseFloat(req.body.amount);
  const id = req.params.id;

  const event_type = "Manual Fund";
  const payment_ref = "Admin Approved";
  const payment_method = "Manual";
  const payment_status = "Approved";
  const paid_on = new Date();

  if (!amount || isNaN(amount)) {
    console.log("Fraud Funding");
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (amount > 10000) {
    console.log("Funding amount exceeds limit");
    return res.status(400).json({ message: "Funding amount exceeds limit" });
  }

  try {
    // Select user balance
    const user = await prisma.users.findUnique({
      where: { d_id: id },
      select: { user_balance: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const walletBalance = parseFloat(user.user_balance);
    const newBalance = walletBalance + amount;

    // Insert into paymentHist
    await prisma.paymentHist.create({
      data: {
        id,
        event_type,
        payment_ref,
        paid_on,
        amount,
        payment_method,
        payment_status,
        prev_balance: walletBalance,
        user_balance: newBalance,
      },
    });

    // Update user balance
    await prisma.users.update({
      where: { d_id: id },
      data: {
        user_balance: newBalance,
        prev_balance: walletBalance,
      },
    });

    res.status(200).json({ message: "Wallet Funded Manually successfully" });
  } catch (err) {
    console.error("Error funding wallet manually", err);
    res.status(500).json({ message: "Failed to fund wallet" });
  }
});


// Select user details by id
router.get("/info/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const user = await prisma.users.findUnique({
      where: { d_id: id },
      select: {
        d_id: true,
        username: true,
        user_email: true,
        user_balance: true,
        packages: true,
        Phone_number: true,
        Pin: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Failed to select user details", err);
    res.status(500).json({ message: "Failed to select user details" });
  }
});


// ✅ Update user details dynamically
router.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { fieldName, value } = req.body;

  // Validate allowed fields
  const allowedFields = [
    "username",
    "user_email",
    "user_balance",
    "packages",
    "Phone_number",
    "Pin",
    "fullName",
  ];

  if (!allowedFields.includes(fieldName)) {
    return res.status(400).json({ message: "Invalid field name" });
  }

  try {
    await prisma.users.update({
      where: { d_id: id },
      data: { [fieldName]: value },
    });

    res.status(200).json({ message: "User details updated successfully" });
  } catch (err) {
    console.error("Failed to update user details", err);
    res.status(500).json({ message: "Failed to update user details" });
  }
});


// ✅ Ban user
router.put("/ban/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await prisma.users.update({
      where: { d_id: id },
      data: { isban: "true" },
    });

    res.status(200).json({ message: "User banned successfully" });
  } catch (err) {
    console.error("Failed to ban user", err);
    res.status(500).json({ message: "Failed to ban user" });
  }
});

export default router;