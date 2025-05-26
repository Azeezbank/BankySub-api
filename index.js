import mysql from "mysql2";
import express from "express";
import dotenv from "dotenv";
//import nodemailer from "nodemailer";
import cors from "cors";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import JWT from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";

const port = process.env.PORT || 3006;

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  method: ["POST", "GET", "DELETE", "PUT"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors(corsOptions));
app.use(cookieParser());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  queueLimit: 0,
  connectionLimit: 4,
  port: process.env.DB_PORT,
});

// db.query("SELECT 1", (err, results) => {
//   if (err) {
//     console.error("Database connection failed", err.message);
//   } else {
//   console.log("Database connected");
//    }
// });

//Create table users
// db.execute(
//   `CREATE TABLE IF NOT EXISTS users(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, username VARCHAR(20), user_pass VARCHAR(255), user_email VARCHAR(100), user_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP, prev_balance INT, user_balance INT, packages ENUM('USER', 'RESELLER', 'API') DEFAULT 'USER', Phone_number VARCHAR(15), Pin INT, role ENUM('admin', 'user') DEFAULT 'user')`,
//   (err, result) => {
//     if (err) throw err;
//     console.log("Table networks created");
//   }
// );

// db.execute(`UPDATE users SET Phone_number = 07080079334 WHERE d_id = 1`, (err, result) => {
//   if (err) throw err;
//   console.log('added')
// });

// db.execute(`CREATE TABLE IF NOT EXISTS networks(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//     if (err) throw err;
//     console.log("Table networks created");
// });

// db.execute(`CREATE TABLE IF NOT EXISTS data_types(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(20), network_name VARCHAR(15), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//     if (err) throw err;
//     console.log("Table data_types created");
// });

// db.execute(`INSERT INTO data_types(name, network_name) VALUES('SME', 'AIRTEL')`, (err, result) => {
//   if (err) throw err;
//   console.log("yes")
// });

// db.execute(`CREATE TABLE IF NOT EXISTS data_plans(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(20), network_name VARCHAR(10), data_type VARCHAR(25), validity VARCHAR(15), USER INT, RESELLER INT, API INT, is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//   if (err) throw err;
//   console.log("Table plans created");
// });

// db.execute(`INSERT INTO data_plans(id, name, network_name, data_type, validity, USER, RESELLER, API) VALUES(424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133), (424, '500 MB', 'AIRTEL', 'SME', '1 day', 135, 134, 133)`, (err, result) => {
//   if (err) throw err;
//   console.log("Airtel SME data plan created")
// });

// db.execute(`update users SET packages = 'USER'`, (err, result) => {
//   if (err) throw err;
//   console.log("yes created")
// });

//  db.execute(`ALTER TABLE userBankDetails1 ADD acct_id INT`, (err, result) => {
//    if (err) throw err;
//    console.log('AdedeEEE');
//  });

//User account details
// db.execute(
//   `CREATE TABLE IF NOT EXISTS userBankDetails1(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(20), acctNo VARCHAR(255), acctName VARCHAR(255), bankName VARCHAR(255), is_active ENUM('active', 'disabled') DEFAULT 'active')`,
//   async (err, result) => {
//     if (err) throw err;
//     console.log("BANK CREATED");
//   }
// );

// db.execute(`INSERT INTO networks(name) VALUES('MTN')`, (err, result) => {
//   if (err) throw err;
//   console.log("yes")
// });

//Route to register user
app.post("/register", async (req, res) => {
  const { password, username, email, phone } = req.body;

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

        const sql = `INSERT INTO users (user_pass, username, user_email, Phone_number) VALUES (?, ?, ?, ?);`;

        db.query(
          sql,
          [hashedPassword, username, email, phone],
          (err, result) => {
            if (err) {
              console.error("Error registering user", err);
              return res.status(401).json({ message: "Error inserting user" });
            }
            return res
              .status(200)
              .json({ message: "User registered successfully" });
          }
        );
      } catch (hashError) {
        console.error("Error hashing password", hashError);
        return res.status(500).json({ message: "Error processing request" });
      }
    }
  );
});

//user login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "User not found" });

      const user = results[0];
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
      });

      res.status(200).json({ message: "login successful" });
    }
  );
});

//Middleware to protect routes
const authenticateToken = (req, res, next) => {
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

//Fetch data network
app.get("/network", authenticateToken, (req, res) => {
  const sql = `SELECT * FROM networks WHERE is_active = 'active'`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server unavailable" });
    }
    res.status(200).json(result);
  });
});

//Protected route
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Authorized" });
});

//Fetch data plan type
app.post("/data/types", authenticateToken, (req, res) => {
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
app.put("/update/data/types/status", (req, res) => {
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
app.post("/data/plans", authenticateToken, (req, res) => {
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
app.get("/all-data-plan", authenticateToken, async (req, res) => {
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
app.get("/data/plan", async (req, res) => {
  const sql = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = 'MTN'`;
  const sql1 = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = 'AIRTEL'`;
  const sql2 = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = 'GLO'`;
  const sql3 = `SELECT d_id, id, name, network_name, data_type, validity, user, reseller, api, is_active FROM data_plans WHERE network_name = '9MOBILE'`;

  db.query(sql, (err, mtn) => {
    if (err) {
      console.log("Failed to select mtn sme data", err);
      return res.status(500).json({ error: "Failed to select mtn data" });
    }
    db.query(sql1, (err, airtel) => {
      if (err) {
        console.log("Failed to select airtel sme data", err);
        return res.status(500).json({ error: "Failed to select airtel data" });
      }
      db.query(sql2, (err, glo) => {
        if (err) {
          console.log("Failed to select glo data", err);
          return res.status(500).json({ error: "Failed to select glo data" });
        }
        db.query(sql3, (err, mobile) => {
          if (err) {
            console.log("Failed to select 9mobile data", err);
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
app.put("/update/sme/data/status", (req, res) => {
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
app.put("/update-data-plans", (req, res) => {
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
app.post("/api/data/bundle", authenticateToken, async (req, res) => {
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
                  console.error("Field to select network", err);
                  return res
                    .status(500)
                    .json({ message: "Field to select network" });
                }
                const networkId = results[0].id;
                console.log("This is network id", networkId);
                const id = result[0].id;

                const requestBody = {
                  network: networkId,
                  mobile_number: mobileNumber,
                  plan: id,
                  Ported_number: true,
                };

                let headers = {};

                if (choosenDataType === "SME") {
                  headers = {
                    Authorization: process.env.SME_DATA_API_TOKEN,
                    "Content-Type": "application/json",
                  };
                } else if (choosenDataType === "GIFTING") {
                  headers = {
                    Authorization: process.env.GIFTING_DATA_API_TOKEN,
                    "Content-Type": "application/json",
                  };
                } else if (choosenDataType === "CORPORATE GIFTING") {
                  headers = {
                    Authorization: process.env.CORPORATE_DATA_API_TOKEN,
                    "Content-Type": "application/json",
                  };
                } else {
                  console.log("Invalid API credentials");
                  return;
                }

                try {
                  let apiUrl = "";
                  if (choosenDataType === "SME") {
                    apiUrl = process.env.SME_DATA_API_URL;
                  } else if (choosenDataType === "GIFTING") {
                    apiUrl = process.env.GIFTING_DATA_API_URL;
                  } else if (choosenDataType === "CORPORATE GIFTING") {
                    apiUrl = process.env.CORPORATE_DATA_API_URL;
                  } else {
                    console.log("Invalid API url");
                    return;
                  }

                  const response = await axios.post(apiUrl, requestBody, {
                    headers,
                  });

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

                      const wallet = result[0].user_balance;
                      if (wallet < DataPrice) {
                        console.error("Insufficient wallet balance");
                        return res
                          .status(404)
                          .json({ message: "Insufficient wallet balance" });
                      }
                      const newBalance = wallet - DataPrice;
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
                            (err, result) => {
                              if (err) {
                                console.error("Failed to set previoud balance");
                                return res.status(500).json({
                                  message: "Failed to set previoud balance",
                                });
                              }

                              if (response.data.status === "failed") {
                                db.execute(
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
                                  }
                                );
                              } else {
                                console.log("Transaction successful");
                              }

                              const status =
                                response.data.Status;
                              const dataHist = `INSERT INTO dataTransactionHist(id, plan, phone_number, amount, balance_before, balance_after, status, time) VALUES(?, ?, ?, ?, ?, ?, ?, NOW())`;
                              db.execute(
                                dataHist,
                                [
                                  userId,
                                  plan,
                                  mobileNumber,
                                  DataPrice,
                                  wallet,
                                  newBalance,
                                  status,
                                ],
                                (err, result) => {
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
app.get("/api/data/history", authenticateToken, (req, res) => {
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

//Airtime section
//Create Airtime network table
// const sql = `CREATE TABLE IF NOT EXISTS AirtimeN(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active', id INT)`;
// db.execute(sql, (err, result) => {
//   if (err) throw err;
//   console.log("Airtime network Table created");
// });

//Insert into Airtime network table
// db.query(`INSERT INTO AirtimeN(name, id) VALUES('GLO', 2)`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
// });

//Create Airtime type table
// const AirtimeT = `CREATE TABLE IF NOT EXISTS AirtimeT(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active')`;
// db.execute(AirtimeT, (err, result) => {
//   if (err) throw err;
//   console.log("Airtime Type Table created");
// });

//Create Airtime history table
// db.execute(`CREATE TABLE IF NOT EXISTS airtimeHist(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, network VARCHAR(15), airtimeType VARCHAR(20), amount VARCHAR(15), phone_number VARCHAR(20), previous_balance VARCHAR(15), new_balance VARCHAR(15), time DATETIME, status VARCHAR(15))`, (err, res) => {
//   if (err) throw err;
//   console.log('airtime record table created')
// });

// db.execute(`ALTER TABLE airtimeHist ADD airtimeType VARCHAR(20)`, (err, result) => {
//   if (err) throw err;
//   console.log('aitime tyope added')
// });

//Insert into Airtime type table
// db.query(`INSERT INTO AirtimeT(name) VALUES('VTU')`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
// });

// Fetch Airtime network
app.get("/api/airtimeN", authenticateToken, (req, res) => {
  const sql = `SELECT * FROM AirtimeN WHERE is_active = 'active'`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server unavailable" });
    }
    res.status(200).json(result);
  });
});

//Fetch Airtime type
app.get("/api/airtimeT", authenticateToken, (req, res) => {
  const sql = `SELECT * FROM AirtimeT WHERE is_active = 'active'`;
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Unable to select Airtime type" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Airtime type not found" });
    }
    res.status(200).json(result);
  });
});

//Fetch Airtime from API
app.post("/api/airtime/topup", authenticateToken, async (req, res) => {
  const { airtimeNChoosen, airtimeTChoosen, mobileN, amount } = req.body;
  const userid = req.user.id;

  const airtimeBody = {
    network: airtimeNChoosen,
    amount: amount,
    mobile_number: mobileN,
    Ported_number: true,
    airtime_type: airtimeTChoosen,
  };

  const headers = {
    Authorization: process.env.AIRTIME_API_TOKEN,
    "Content-Type": "application/json",
  };
  console.log(process.env.AIRTIME_API_URL);
  try {
    const response = await axios.post(
      process.env.AIRTIME_API_URL,
      airtimeBody,
      { headers }
    );
    //Deduct payment
    db.execute(
      `SELECT user_balance FROM users WHERE d_id = ?`,
      [userid],
      (err, result) => {
        if (err || result.length === 0) {
          console.error("Error slecting user balance");
          return res
            .status(500)
            .json({ message: "Error slecting user balance" });
        }

        const wallet = result[0].user_balance;
        if (wallet < amount) {
          console.error("Insufficient wallet balance");
          return res
            .status(404)
            .json({ message: "Insufficient wallet balance" });
        }
        const newBalance = wallet - amount;
        db.execute(
          `UPDATE users SET user_balance = ? WHERE d_id = ?`,
          [newBalance, userid],
          (err, result) => {
            if (err) {
              console.error("Failed to deduct user wallet for airtime");
              return res
                .status(500)
                .json({ message: "Failed to deduct user wallet for airtime" });
            }
            db.execute(
              `UPDATE users SET prev_balance = ? WHERE d_id = ?`,
              [wallet, userid],
              (err, result) => {
                if (err) {
                  console.error("Failed to set previoud balance");
                  return res
                    .status(500)
                    .json({ message: "Failed to set previoud balance" });
                }

                if (
                  response.data.status === "failed" ||
                  response.data.status === "Failed"
                ) {
                  db.execute(
                    `UPDATE users SET user_balance = ? WHERE d_id = ?`,
                    [wallet, userid],
                    async (err, result) => {
                      if (err) {
                        console.error("Failed to refund user");
                      }
                      console.log("User refunded");
                    }
                  );
                } else {
                  console.log("Transaction successful");
                }

                const status =
                  response.data.Status;

                const hist = `INSERT INTO airtimeHist(id, network, amount, phone_number, previous_balance, new_balance, status, airtimeType) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
                db.execute(
                  hist,
                  [
                    userid,
                    airtimeNChoosen,
                    mobileN,
                    wallet,
                    newBalance,
                    status,
                    airtimeTChoosen,
                  ],
                  (err, result) => {
                    if (err) {
                      console.log(
                        "Failed to insert airtime transaction history",
                        err.message
                      );
                      return res
                        .status(500)
                        .json({
                          message:
                            "Failed to insert airtime transaction history",
                        });
                    }

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
    console.error(err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch Airtime from external API" });
  }
});

// Fetch airtime transaction histories
app.get("/api/airtime/history", authenticateToken, (req, res) => {
  const userid = req.user.id;
  const sql = `SELECT d_id, network, amount, phone_number, previous_balance, new_balance, status, airtimeType, time FROM airtimeHist WHERE id = ?`;
  db.query(sql, [userid], (err, result) => {
    if (err) {
      console.log("Failed to select airtime transaction history", err.message);
      return res
        .status(500)
        .jsom({ message: "Failed to select airtime transaction history" });
    }

    res.status(200).json(result);
  });
});

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

// db.execute(`DELETE FROM userBankDetails1`, (err, result) => {
//   if (err) throw err;
//   console.log('deleted')
// })

//Payment connection
app.post("/dedicated/account", authenticateToken, async (req, res) => {
  //Create dedicated account number
  const userid = req.user.id;
  try {
    const token = await authenticate();
    const randomRef = Math.floor(1000 + Math.random() * 9000);

    const userD = `SELECT username, user_email, nin FROM users WHERE d_id = ?`;
    db.query(userD, [userid], async (err, userDetails) => {
      if (err) {
        console.log(err.message);
        return res
          .status(500)
          .json({ message: "Unable to select user details" });
      }
      const userDetail = userDetails[0];

      if (userDetails.length === 0) {
        return res.status(404).json({ message: " User Not Found" });
      }

      const response = await axios.post(
        `${MON_BASE_URL}/api/v1/bank-transfer/reserved-accounts`,
        {
          accountReference: `${randomRef}`,
          accountName: userDetail.username,
          currencyCode: "NGN",
          contractCode: MON_CONTRACT_CODE,
          customerEmail: userDetail.user_email,
          nin: userDetails[0].nin,
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
      console.log(response.data.responseBody);
      const acctNo = response.data.responseBody.accountNumber;
      const acctName = response.data.responseBody.accountName;
      const bankName = response.data.responseBody.bankName;
      const refrence = response.data.responseBody.accountReference;
      const sql = `INSERT INTO userBankDetails1 (id, acct_id, acctNo, acctName, bankName) VALUES (?, ?, ?, ?)`;
      db.query(
        sql,
        [userid, refrence, acctNo, acctName, bankName],
        (err, result) => {
          if (err) {
            console.log("Error inserting bank details");
            return res
              .status(500)
              .json({ message: "Error inserting bank details" });
          }
          console.log("Bank details innserted");
          return res.status(200).json(response.data);
        }
      );
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Select user bank details
app.post("/api/user_account", authenticateToken, (req, res) => {
  const userid = req.user.id;
  const sql = `SELECT * FROM userBankDetails1 WHERE id = ? AND is_active = 'active'`;
  db.query(sql, [userid], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error selecting user bank details" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "No details found" });
    }
    res.status(200).json(result);
  });
});

//Select user details
app.get("/api/user_info", authenticateToken, (req, res) => {
  const userid = req.user.id;
  const sql = `SELECT username, user_balance, role, packages FROM users WHERE d_id = ?`;
  db.query(sql, [userid], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error selecting user" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(result);
  });
});

//Payment transaction table
// const sql2 = `CREATE TABLE IF NOT EXISTS paymentHist(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, event_type VARCHAR(100), payment_ref VARCHAR(255), paid_on DATETIME, amount INT, payment_method VARCHAR(255), payment_status VARCHAR(50), prev_balance INT, user_balance INT)`;
// db.execute(sql2, (err, result) => {
//   if (err) {
//     console.error(err);
//   }
//   console.log("paymentHist table created");
// });

//Payment webhook
app.post("/monnify/webhook", async (req, res) => {
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
  const amountPaid = payload.eventData.amountPaid;
  const paymentMethod = payload.eventData.paymentMethod;
  const paymentStatus = payload.eventData.paymentStatus;

  const chargesPercent = 2;
  const charges = (chargesPercent / 100) * amountPaid;
  const netAmount = amountPaid - charges;

  try {
    db.query(
      `SELECT user_balance FROM users WHERE d_id = ?`,
      [reference],
      (err, result) => {
        if (err || result.length === 0) {
          return res
            .status(500)
            .json({ message: "Failed to select user balance" });
        }

        const prevBalance = result[0].user_balance;
        const newBalance = prevBalance + netAmount;

        const sql = `INSERT INTO paymentHist(id, event_type, payment_ref, paid_on, amount, payment_method, payment_status, prev_balance, user_balance) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.execute(
          sql,
          [
            reference,
            eventType,
            paymentRef,
            paidOn,
            netAmount,
            paymentMethod,
            paymentStatus,
            prevBalance,
            newBalance,
          ],
          (err, result) => {
            if (err) {
              console.error("Failed to insert payment history", err);
              return res
                .status(500)
                .json({ message: "Failed to insert payment history" });
            }

            db.execute(
              `UPDATE users SET user_balance = ?, prev_balance = ? WHERE d_id = ?`,
              [newBalance, prevBalance, reference],
              (err, result) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ message: "Failed to update user balance" });
                }
                res
                  .status(200)
                  .json({ message: "Webhook proccessed successfully" });
              }
            );
          }
        );
      }
    );
    // }
    //)
  } catch (err) {
    console.error("Error inserting payment:", err);
  }
});

// fetch payment history
app.get("/payment-history", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM paymentHist";
  const dataQuery = "SELECT * FROM paymentHist LIMIT ? OFFSET ?";

  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    const total = countResult[0].total;
    db.query(dataQuery, [limit, offset], (err, dataResult) => {
      if (err) return res.status(500).json({ message: "Server Error" });
      res.json({
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
        data: dataResult,
      });
    });
  });
});

// Fetch User Details
app.get("/users", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM users";
  const sql = `SELECT d_id, id, username, user_email, user_balance, packages, Phone_number, Pin FROM users LIMIT ?, ?`;
  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    const total = countResult[0].total;

    db.query(sql, [offset, limit], (err, dataResult) => {
      if (err) {
        console.log("Error selecting user details");
        return res
          .status(500)
          .json({ message: "Error selecting user details" });
      }
      const totalPage = Math.ceil(total / limit);

      res.status(200).json({
        total,
        page,
        limit,
        totalPage,
        data: dataResult,
      });
    });
  });
});

//  db.execute(
//   `CREATE TABLE IF NOT EXISTS dataTransactionHist(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, plan VARCHAR(255), phone_number VARCHAR(20), amount VARCHAR(20), balance_before VARCHAR(20), balance_after VARCHAR(20), status VARCHAR(20), time DATETIME)`,
//   (err, result) => {
//     if (err) throw err;
//     console.log("Table datahist created");
//   }
// );

//setting details table
// const sql = `CREATE TABLE IF NOT EXISTS admin_setting(d_id INT PRIMARY KEY AUTO_INCREMENT, whatsapp_phone VARCHAR(15), whatsapp_link VARCHAR(255), dash_message TEXT)`;
// db.execute(sql, (err, result) => {
//   if (err) throw err;
//   console.log('admin setting table created')
// });

// Admin transaction history
// const sql = `CREATE TABLE IF NOT EXISTS transactionWebHook(d_id INT AUTO_INCREMENT PRIMARY KEY,  webHook_response VARCHAR(800), create_date DATETIME)`;
// db.execute(sql, (err, result) => {
//   if (err) throw err;
//   console.log('admindTranaction table created successfully');
// });

// db.execute(`DROP TABLE dataTransactionHist`, (err, result) => {
//   if (err) throw err;
//   console.log('Datble deleted')
// });

// Update setting details
app.put("/api/updated=setting=details", async (req, res) => {
  const { whatsapp_phone, whatsapp_link, dash_message } = req.body;
  db.query(`SELECT d_id FROM admin_setting`, (err, result) => {
    if (err) {
      console.log("Error fetching admin details", err);
      return res.status(500).json({ message: "Error fetching admin details" });
    }

    if (result.length > 0) {
      const userId = result[0].d_id;
      db.execute(
        `UPDATE admin_setting SET whatsapp_phone = ?, whatsapp_link = ?, dash_message = ? WHERE d_id = ?`,
        [whatsapp_phone, whatsapp_link, dash_message, userId],
        (err, result) => {
          if (err) {
            console.log("Error updating admin details", err);
            return res
              .status(500)
              .json({ message: "Error updating admin details" });
          }
          res.status(200).json({ message: "User details updated" });
        }
      );
    } else {
      db.execute(
        `INSERT INTO admin_setting(whatsapp_phone, whatsapp_link, dash_message) VALUES(?, ?, ?)`,
        [whatsapp_phone, whatsapp_link, dash_message],
        (err, result) => {
          if (err) {
            console.log("Error inseting admin details", err);
            return res
              .status(500)
              .json({ message: "Error inserting admin details", err });
          }
          res.status(200).json({ message: "User details inserted" });
        }
      );
    }
  });
});

//setting details
app.get("/api/admin-details", (req, res) => {
  db.execute(
    `SELECT whatsapp_phone, whatsapp_link, dash_message FROM admin_setting`,
    (err, result) => {
      if (err) {
        console.log("Error selecting admin details", err);
        return res
          .status(500)
          .json({ message: "Error selecting admin details" });
      }
      res.status(200).json(result[0]);
    }
  );
});

//Fetch dashbord message
app.get("/api/dashboard-message", (req, res) => {
  const sql = `SELECT whatsapp_link, dash_message FROM admin_setting`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error fetching dashboard message" });
    }
    res.status(200).json(result[0]);
  });
});

//Data webhook transaction histories
app.post("/api/transaction/histories/webhook", async (req, res) => {
  const payload = req.body;
  const sql = `INSERT INTO transactionWebHook(webHook_response) VALUES(?)`;
  db.execute(sql, [payload], (err, results) => {
    if (err) {
      console.log("Failed to insert webhool transaction details");
      return res
        .status(500)
        .json({ message: "Failed to insert webhook transaction details" });
    }
    res
      .status(200)
      .json({
        message: "Webhook transaction details has been successfully inserted",
      });
  });
});

//update user account verification
app.post("/verify/account", authenticateToken, (req, res) => {
  const { verificationType, verificationNumber } = req.body;
  const userid = req.user.id;

  if (verificationNumber.length !== 11)
    return res.status(400).json({ message: "Invalid NIN" });

  let type = "";
  if (verificationType == "NIN") {
    type = "nin";
  } else if (verificationType === "BVN") {
    type = "bvn";
  } else {
    console.log("Invalid verification type");
    return res.status(404).json({ message: "Invalid verification type" });
  }

  console.log("User id", userid);
  const sql = `UPDATE users SET ${type} = ? WHERE d_id = ?`;
  db.execute(sql, [verificationNumber, userid], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Failed to verify user account" });
    }
    console.log("Success");
    res.status(200).json({ message: "User Account Verified" });
  });
});

//Logout route
app.post("/logout", authenticateToken, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "logout successfully" });
});

//Connection port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
