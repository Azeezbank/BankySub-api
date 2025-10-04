import express from "express";
import axios from "axios";
import { decrypt } from "../uttilis/encrypt.js";
import prisma from '../Prisma.client.js';
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();




// db.execute(`INSERT INTO data_types(name, network_name) VALUES('GIFTING', 'GLO')`, (err, result) => {
//   if (err) throw err;
//   console.log("TYPES ADDED")
// });


// db.execute(`INSERT INTO data_plans(id, name, network_name, data_type, validity, USER, RESELLER, API) VALUES(424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133)`, (err, result) => {
//   if (err) throw err;
//   console.log("Airtel SME data plan created")
// });


// Fetch data plan type
router.post("/types", async (req, res) => {
  const { choosenNetwork } = req.body;

  try {
    const result = await prisma.data_types.findMany({
      where: {
        network_name: choosenNetwork,
        is_active: "active",
      },
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to select network", err.message);
    return res.status(500).json({ Error: "Failed to select network" });
  }
});

// Fetch data types for data types status (update)
router.put("/update/types/status", async (req, res) => {
  const { dataTypeNetworkName, dataTypeName, isDataTypeStatus } = req.body;

  try {
    await prisma.data_types.updateMany({
      where: {
        network_name: dataTypeNetworkName,
        name: dataTypeName,
      },
      data: {
        is_active: isDataTypeStatus,
      },
    });

    res.status(200).json({ message: "Data type status updated successfully" });
  } catch (err) {
    console.error("Failed to update data type status", err.message);
    return res.status(500).json({ message: "Failed to update data type status" });
  }
});


// Fetch data plans
router.post("/plans", async (req, res) => {
  const { choosenNetwork, choosenDataType } = req.body;
  const userId = req.user.id;

  try {
    const user = await prisma.users.findUnique({
      where: { d_id: userId },
      select: { packages: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let packag = "";
    if (user.packages === "USER") {
      packag = "USER";
    } else if (user.packages === "RESELLER") {
      packag = "RESELLER";
    } else if (user.packages === "API") {
      packag = "API";
    } else {
      console.log("Invalid package type");
      return res.status(400).json({ message: "Invalid package type" });
    }

    const plans = await prisma.data_plans.findMany({
      where: {
        network_name: choosenNetwork,
        data_type: choosenDataType,
        is_active: "active",
      },
      select: {
        d_id: true,
        id: true,
        name: true,
        network_name: true,
        data_type: true,
        validity: true,
        [packag]: true,
      },
    });

    res.status(200).json(plans);
  } catch (err) {
    console.error("Failed to fetch data plans", err);
    return res.status(500).json({ message: "Failed to fetch data plans" });
  }
});

// Fetch all data plans
router.get("/all/plan", async (req, res) => {
  try {
    const result = await prisma.data_plans.findMany({
      select: {
        d_id: true,
        id: true,
        name: true,
        network_name: true,
        data_type: true,
        validity: true,
        user: true,
        reseller: true,
        api: true,
        is_active: true,
      },
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to select mtn sme data", err);
    return res.status(500).json({ error: "Failed to select mtn sme data" });
  }
});


// Fetch MTN, Airtel, Glo, and 9Mobile data plans by network
router.get("/plan", async (req, res) => {
  try {
    const [mtn, airtel, glo, mobile] = await Promise.all([
      prisma.data_plans.findMany({
        where: { network_name: "MTN" },
        select: {
          d_id: true,
          id: true,
          name: true,
          network_name: true,
          data_type: true,
          validity: true,
          user: true,
          reseller: true,
          api: true,
          is_active: true,
        },
      }),
      prisma.data_plans.findMany({
        where: { network_name: "AIRTEL" },
        select: {
          d_id: true,
          id: true,
          name: true,
          network_name: true,
          data_type: true,
          validity: true,
          user: true,
          reseller: true,
          api: true,
          is_active: true,
        },
      }),
      prisma.data_plans.findMany({
        where: { network_name: "GLO" },
        select: {
          d_id: true,
          id: true,
          name: true,
          network_name: true,
          data_type: true,
          validity: true,
          user: true,
          reseller: true,
          api: true,
          is_active: true,
        },
      }),
      prisma.data_plans.findMany({
        where: { network_name: "9MOBILE" },
        select: {
          d_id: true,
          id: true,
          name: true,
          network_name: true,
          data_type: true,
          validity: true,
          user: true,
          reseller: true,
          api: true,
          is_active: true,
        },
      }),
    ]);

    res.status(200).json({ mtn, airtel, glo, mobile });
  } catch (err) {
    console.error("Failed to fetch data plans", err);
    return res.status(500).json({ error: "Failed to fetch data plans" });
  }
});

// Update SME data type status
router.put("/update/sme/status", async (req, res) => {
  const { isSmeActive } = req.body;

  try {
    await prisma.data_types.updateMany({
      where: { name: "SME" },
      data: { is_active: isSmeActive },
    });

    res
      .status(200)
      .json({ message: "SME data status updated successfully" });
  } catch (err) {
    console.error("Error updating SME data status", err.message);
    return res
      .status(500)
      .json({ message: "Error updating SME data status" });
  }
});


// Update data plans
router.put("/update/plans", async (req, res) => {
  const mtnSme = req.body; // Expecting an array of plans

  try {
    // Run all updates in parallel
    await Promise.all(
      mtnSme.map(
        ({
          d_id,
          id,
          name,
          network_name,
          data_type,
          validity,
          user,
          reseller,
          api,
          is_active,
        }) =>
          prisma.data_plans.update({
            where: { d_id },
            data: {
              id,
              name,
              network_name,
              data_type,
              validity,
              user,
              reseller,
              api,
              is_active,
            },
          })
      )
    );

    res
      .status(200)
      .json({ message: "All MTN SME data plans updated successfully" });
  } catch (err) {
    console.error("Error updating data:", err.message);
    res
      .status(500)
      .json({ error: "Failed to update one or more plans", details: err.message });
  }
});


      // Fetch data from API (Purchase Data Bundle)
router.post("/purchase/bundle", async (req, res) => {
  const {
    plan,
    DataPrice,
    mobileNumber,
    choosenNetwork,
    choosenDataType,
    pin,
  } = req.body;
  const userId = req.user.id;

  try {
    // 1. Get user details
    const user = await prisma.users.findFirst({
      where: { d_id: userId },
      select: { packages: true, user_balance: true, Pin: true },
    });

    if (!user) {
      return res.status(400).json({ message: "Error selecting user packages" });
    }

    const Pin = parseInt(pin, 10);
    if (user.Pin !== Pin) {
      return res.status(400).json({ message: "Incorrect Transaction Pin" });
    }

    // 2. Determine package
    let price;
    if (user.packages === "USER") price = "USER";
    else if (user.packages === "RESELLER") price = "RESELLER";
    else if (user.packages === "API") price = "API";
    else return res.status(400).json({ message: "No package found" });

    // 3. Select data plan
    const plans = await prisma.data_plans.findMany({
      where: {
        network_name: choosenNetwork,
        data_type: choosenDataType,
        is_active: "active",
        [price]: DataPrice,
      },
    });

    if (!plans || plans.length === 0) {
      return res.status(404).json({ message: "Failed to select plan" });
    }
    const id = plans[0].id;

    // 4. Get network id
    const results = await prisma.networks.findFirst({
      where: { name: choosenNetwork },
      select: { id: true },
    });
    if (!results) {
      return res.status(404).json({ message: "Failed to select network" });
    }

    const networkId = results.id;

    // Map for ncWallet
    let ncNetworkId;
    if (networkId === 1) ncNetworkId = 1;
    else if (networkId === 4) ncNetworkId = 2;
    else if (networkId === 2) ncNetworkId = 3;
    else if (networkId === 3) ncNetworkId = 4;

    // Request bodies
    const ncRequestBody = {
      network: ncNetworkId,
      phone_number: mobileNumber,
      data_plan: id,
      bypass: true,
    };
    const requestBody = {
      network: networkId,
      mobile_number: mobileNumber,
      plan: id,
      Ported_number: true,
    };

    // 5. Get API details
    const apiDocs = await prisma.env.findFirst({
      where: { service_type: choosenDataType },
      select: { api_key: true, api_url: true },
    });
    if (!apiDocs) {
      return res
        .status(404)
        .json({ message: "No API found for the given service type" });
    }

    const { api_key, api_url } = apiDocs;
    const decryptKey = decrypt(api_key);
    const headers = {
      Authorization: decryptKey,
      "Content-Type": "application/json",
    };

    // 6. Wallet check
    const wallet = parseFloat(user.user_balance.toString());
    if (wallet < parseFloat(DataPrice)) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }
    const newBalance = wallet - parseFloat(DataPrice);

    await prisma.users.update({
      where: { d_id: userId },
      data: { user_balance: newBalance, prev_balance: wallet },
    });

    // 7. Call API
    let response;
    if (choosenDataType === "DATA SHARE") {
      response = await axios.post(api_url, ncRequestBody, { headers });
    } else {
      response = await axios.post(api_url, requestBody, { headers });
    }

    const status = response.data.Status ?? response.data.status;

    // 8. Refund if failed
    if (
      status === "failed" ||
      status === "Failed" ||
      status === "Fail" ||
      status === "fail" ||
      (typeof status === "number" && status >= 400)
    ) {
      await prisma.users.update({
        where: { d_id: userId },
        data: { user_balance: wallet },
      });
      return res.status(502).json({ message: "Transaction failed", status });
    }

    // 9. Save transaction history
    await prisma.dataTransactionHist.create({
      data: {
        id: userId,
        plan,
        phone_number: mobileNumber,
        amount: parseFloat(DataPrice),
        balance_before: wallet,
        balance_after: newBalance,
        status: status.toString(),
      },
    });

    // 10. Reward cashback
    const cashBack = (0.2 / 100) * parseFloat(DataPrice);
    await prisma.users.update({
      where: { d_id: userId },
      data: { cashback: { increment: cashBack } },
    });

    res.status(200).json({ message: "Data purchase successful" });
  } catch (err) {
    console.error("Failed to fetch from API", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch data from external API" });
  }
});
  
          
// get data transaction history
router.get("/history", async (req, res) => {
  const userId = req.user.id;

    const result = await prisma.dataTransactionHist.findMany({ where: {id: userId},
    select: {
      d_id: true, plan: true, phone_number: true, amount: true, balance_before: true, balance_after: true, status: true, time: true
    }})
    if (!result) {
      console.error("Failed to select data transaction", err);
      return res.status(500).json({ message: "Failed to select data transaction" });
    }
    res.status(200).json(result);
  });


export default router;