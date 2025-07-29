import express from "express";
import db from '../config/database.js';
import axios from "axios";
import { decrypt } from "../uttilis/encrypt.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
const prisma = new PrismaClient();
const router = express.Router();
dotenv.config();



//  db.execute(
//   `CREATE TABLE IF NOT EXISTS dataTransactionHist(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, plan VARCHAR(255), phone_number VARCHAR(20), amount VARCHAR(20), balance_before VARCHAR(20), balance_after VARCHAR(20), status VARCHAR(20), time DATETIME)`,
//   (err, result) => {
//     if (err) throw err;
//     console.log("Table datahist created");
//   }
// );

// db.execute(`CREATE TABLE IF NOT EXISTS data_types(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(20), network_name VARCHAR(15), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//     if (err) throw err;
//     console.log("Table data_types created");
// });

// db.execute(`INSERT INTO data_types(name, network_name) VALUES('GIFTING', 'GLO')`, (err, result) => {
//   if (err) throw err;
//   console.log("TYPES ADDED")
// });

// db.execute(`CREATE TABLE IF NOT EXISTS data_plans(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(20), network_name VARCHAR(10), data_type VARCHAR(25), validity VARCHAR(15), USER INT, RESELLER INT, API INT, is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//   if (err) throw err;
//   console.log("Table plans created");
// });

// db.execute(`INSERT INTO data_plans(id, name, network_name, data_type, validity, USER, RESELLER, API) VALUES(424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133)`, (err, result) => {
//   if (err) throw err;
//   console.log("Airtel SME data plan created")
// });


//Fetch data plan type
router.post("/types", (req, res) => {
  const { choosenNetwork } = req.body;
  const sql = `SELECT * FROM data_types WHERE network_name = ? AND is_active = 'active'`;
  db.query(sql, [choosenNetwork], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ Error: "Failed to select network" });
    }
    res.status(200).json(result);
  });
});

//Fetch data types for data types status
router.put("/update/types/status", (req, res) => {
  const { dataTypeNetworkName, dataTypeName, isDataTypeStatus } = req.body;
  const sql = `UPDATE data_types SET is_active = ? WHERE network_name = ? AND name = ?`;
  db.execute(
    sql,
    [isDataTypeStatus, dataTypeNetworkName, dataTypeName],
    async (err, result) => {
      if (err) {
        console.error("Failed to update data type status", err);
        return res
          .status(500)
          .json({ message: "Failed to update data type status" });
      }
      res
        .status(200)
        .json({ message: "Data type status updated successfully" });
    }
  );
});

//Fetch data plans
router.post("/plans", (req, res) => {
  const { choosenNetwork, choosenDataType } = req.body;
  const userid = req.user.id;

  db.query(
    `SELECT packages FROM users WHERE d_id = ?`,
    [userid],
    (err, result) => {
      if (err) {
        console.log("Failed to select user packages");
        return res
          .status(500)
          .json({ message: "Failed to select user packages" });
      }
      const packages = result[0].packages;
      let packag = "";
      if (packages === "USER") {
        packag = "user";
      } else if (packages === "RESELLER") {
        packag = "reseller";
      } else if (packages === "API") {
        packag = "api";
      } else {
        console.log("Invalid package type");
        return;
      }

      const sql = `SELECT d_id, id, name, network_name, data_type, validity, ${packag} FROM data_plans WHERE network_name = ? AND is_active = 'active' AND data_type = ?`;
      db.query(sql, [choosenNetwork, choosenDataType], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ Error: "Failed to select data type" });
        }
        res.status(200).json(result);
      });
    }
  );
});

//Fetch mtn data plans
router.get("/all/plan", async (req, res) => {
  const sql = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log("Failed to select mtn sme data", err);
      return res.status(500).json({ error: "Failed to select mtn sme data" });
    }
    res.status(200).json(result);
  });
});

//Fetch mtn data plans by network
router.get("/plan", async (req, res) => {
  const sql = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = 'MTN'`;
  const sql1 = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = 'AIRTEL'`;
  const sql2 = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = 'GLO'`;
  const sql3 = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = '9MOBILE'`;

  db.query(sql, (err, mtn) => {
    if (err) {
      console.log("Failed to select mtn data", err);
      return res.status(500).json({ error: "Failed to select mtn data" });
    }
    db.query(sql1, (err, airtel) => {
      if (err) {
        console.log("Failed to select airtel data", err);
        return res.status(500).json({ error: "Failed to select airtel data" });
      }
      db.query(sql2, (err, glo) => {
        if (err) {
          console.log("Failed to select glo data", err);
          return res.status(500).json({ error: "Failed to select glo data" });
        }
        db.query(sql3, (err, mobile) => {
          if (err) {
            console.log("Failed to select 9mobile 'data", err);
            return res
              .status(500)
              .json({ error: "Failed to select 9mobile data" });
          }
          res.status(200).json({ mtn, airtel, glo, mobile });
        });
      });
    });
  });
});

//update plans status
router.put("/update/sme/status", (req, res) => {
  const { isSmeActive } = req.body;
  const sql = `UPDATE data_types SET is_active = ? WHERE name = 'SME'`;
  db.execute(sql, [isSmeActive], (err, result) => {
    if (err) {
      console.log("Error updating SME data status", err);
      return res
        .status(500)
        .json({ message: "Error updating SME data status" });
    }
    res.status(200).json({ message: "SME data status updated successfully" });
  });
});

// Update data plans
router.put("/update/plans", (req, res) => {
  const mtnSme = req.body;

  const newPromise = mtnSme.map(
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
    }) => {
      const sql = `UPDATE data_plans SET id = ?, name = ?, network_name = ?, data_type = ?, validity = ?, user = ?, reseller = ?, api = ?, is_active = ? WHERE d_id = ?`;
      return new Promise((resolve, reject) => {
        db.execute(
          sql,
          [
            id,
            name,
            network_name,
            data_type,
            validity,
            user,
            reseller,
            api,
            is_active,
            d_id,
          ],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    }
  );
  Promise.all(newPromise)
    .then(() => {
      res
        .status(200)
        .json({ message: "All MTN SME data plans updated successfully" });
    })
    .catch((err) => {
      console.error("Error updating data:", err);
      res
        .status(500)
        .json({ error: "Failed to update one or more plans", err });
    });
});

//Fetch data from API
router.post("/purchase/bundle", async (req, res) => {
  const { plan, DataPrice, mobileNumber, choosenNetwork, choosenDataType } =
    req.body;
  const userId = req.user.id;
  try {
    db.query(
      `SELECT packages FROM users WHERE d_id = ?`,
      [userId],
      async (err, userPack) => {
        if (err) {
          console.error("Error selecting user packages", err);
          return res
            .status(500)
            .json({ message: "Error selecting user packages" });
        }
        const userPackage = userPack[0].packages;

        let price = "";
        if (userPackage === "USER") {
          price = "user";
        } else if (userPackage === "RESELLER") {
          price = "reseller";
        } else if (userPackage === "API") {
          price = "api";
        } else {
          console.log("No package found");
          return;
        }

        const sql = `SELECT * FROM data_plans WHERE network_name = ? AND data_type = ? AND ${price} = ? AND is_active = 'active'`;
        db.query(
          sql,
          [choosenNetwork, choosenDataType, DataPrice],
          async (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Data query error" });
            }
            if (result.length === 0) {
              console.log("Plan not found");
              return res.status(404).json({ error: "Plan not found" });
            }
            db.query(
              `SELECT id FROM networks WHERE name = ?`,
              [choosenNetwork],
              async (err, results) => {
                if (err) {
                  console.log("Field to select network", err);
                  return res
                    .status(500)
                    .json({ message: "Field to select network" });
                }
                const networkId = results[0].id;
                console.log("This is network id", networkId);
                const id = result[0].id;

                // modify network id for nc wallet using data share
                let ncNetworkId = null;
                if (networkId === 1) {
                  ncNetworkId = 1
                } else if (networkId === 4) {
                  ncNetworkId = 2
                } else if (networkId === 2) {
                  ncNetworkId = 3
                } else if (networkId === 3) {
                  ncNetworkId = 4
                }

                //nc wallet body
                const ncRequestBody = {
                  network: ncNetworkId,
                  phone_number: mobileNumber,
                  data_plan: id,
                  bypass: true,
                }

                const requestBody = {
                  network: networkId,
                  mobile_number: mobileNumber,
                  plan: id,
                  Ported_number: true,
                };

                db.query(`SELECT api_key, api_url FROM env WHERE service_type = ?`, [choosenDataType], async (err, apiDocs) => {
                  if (err) {
                    console.error('Failed to select api details.', err.message);
                    return;
                  }

                  if (!apiDocs || apiDocs.length === 0) {
                    console.error("No API found for the given service type.");
                    return;
                  }
                  const { api_key, api_url } = apiDocs[0];
                  const decryptKey = decrypt(api_key);

                  let headers = {
                    Authorization: decryptKey,
                    "Content-Type": "application/json"
                  };

                  try {
                    //Deduct payment
                    db.execute(
                      `SELECT user_balance FROM users WHERE d_id = ?`,
                      [userId],
                      (err, result) => {
                        if (err || result.length === 0) {
                          console.error("Error slecting user balance");
                          return res
                            .status(500)
                            .json({ message: "Error slecting user balance" });
                        }

                        const wallet = parseFloat(result[0].user_balance);
                        if (wallet < parseFloat(DataPrice)) {
                          console.error("Insufficient wallet balance");
                          return res
                            .status(404)
                            .json({ message: "Insufficient wallet balance" });
                        }
                        const newBalance = wallet - parseFloat(DataPrice);

                        //Deduct user
                        db.execute(
                          `UPDATE users SET user_balance = ? WHERE d_id = ?`,
                          [newBalance, userId],
                          (err, result) => {
                            if (err) {
                              console.error(
                                "Failed to deduct user wallet for Data"
                              );
                              return res.status(500).json({
                                message: "Failed to deduct user wallet for Data",
                              });
                            }

                            db.execute(
                              `UPDATE users SET prev_balance = ? WHERE d_id = ?`,
                              [wallet, userId],
                              async (err, result) => {
                                if (err) {
                                  console.error("Failed to set previous balance");
                                  return res.status(500).json({
                                    message: "Failed to set previous balance",
                                  });
                                }


                                //choose api call for ncwallet and msorg
                                let response;
                                //nc wallet
                                if (choosenDataType === 'DATA SHARE') {
                                  response = await axios.post(api_url, ncRequestBody, {
                                    headers,
                                  });
                                } else {

                                  //msorg
                                  response = await axios.post(api_url, requestBody, {
                                    headers,
                                  });
                                }


                                const status =
                                  response.data.Status ?? response.data.status;

                                if (status === "failed" || status === "Failed" ||
                                  status === "Fail" || status === "fail" || status >= 400) {
                                  return db.execute(
                                    `UPDATE users SET user_balance = ? WHERE d_id = ?`,
                                    [wallet, userId],
                                    (err, result) => {
                                      if (err) {
                                        console.error("Failed to refund user");
                                        return res
                                          .status(404)
                                          .json({
                                            message: "Failed to refund user",
                                          });
                                      }
                                      console.log("User refunded");
                                      return res.status(500).json({ message: 'Transaction Failed' });
                                    }
                                  );
                                }

                                const dataHist = `INSERT INTO dataTransactionHist(id, plan, phone_number, amount, balance_before, balance_after, status, time) VALUES(?, ?, ?, ?, ?, ?, ?, NOW())`;
                                db.execute(
                                  dataHist,
                                  [
                                    userId,
                                    plan,
                                    mobileNumber,
                                    parseFloat(DataPrice),
                                    wallet,
                                    newBalance,
                                    status,
                                  ],
                                  async (err, result) => {
                                    if (err) {
                                      console.log(
                                        "Failed to insert transaction record",
                                        err.message
                                      );
                                      return res
                                        .status(500)
                                        .json({
                                          message:
                                            "Failed to insert transaction record",
                                        });
                                    }

                                    // reward user with cashback
                                    const cashBack = (0.2 / 100) * parseFloat(DataPrice);
                                    await prisma.users.update({
                                      where: { d_id: userId }, data: {
                                        cashback:
                                          { increment: cashBack }
                                      }
                                    });
                                    res.status(200).json(response.data);
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  } catch (err) {
                    console.error("Failed to fetch from API", err);
                    res
                      .status(500)
                      .json({ error: "Failed to fetch data from external API" });
                  }
                });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.error("Server error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// get data transaction history
router.get("/history", (req, res) => {
  const userId = req.user.id;
  const sql = `SELECT d_id, plan, phone_number, amount, balance_before, balance_after, status, time FROM dataTransactionHist WHERE id = ? ORDER BY time DESC`;
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Failed to select data transaction", err.message);
      return res
        .status(500)
        .json({ message: "Failed to select data transaction" });
    }
    res.status(200).json(result);
  });
});


export default router;