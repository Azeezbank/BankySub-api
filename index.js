import mysql from "mysql2";
import express from "express";
import dotenv from "dotenv";
//import nodemailer from "nodemailer";
import cors from "cors";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import JWT from "jsonwebtoken";
//import multer from 'multer';
import axios from "axios";

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
  connectionLimit: 10,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed", err.stack);
    return;
  }
  console.log("Database connected" + " " + connection.threadId);
  connection.release();
});

//Create table users
db.query(
  `CREATE TABLE IF NOT EXISTS users(d_id INT PRIMARY KEY AUTO_INCREMENT, user_pass VARCHAR(255), username VARCHAR(255), user_email VARCHAR(255), user_registered DATETIME DEFAULT CURRENT_TIMESTAMP, user_balance DECIMAL(10,2) DEFAULT 0.00)`,
  (err, result) => {
    if (err) throw err;
    console.log("Table networks created");
  }
);

// db.query(`CREATE TABLE IF NOT EXISTS networks(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//     if (err) throw err;
//     console.log("Table networks created");
// });

// db.query(`queryCREATE TABLE IF NOT EXISTS data_types(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(20), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//     if (err) throw err;
//     console.log("Table data_types created");
// });

// db.query(`CREATE TABLE IF NOT EXISTS data_plans(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(20), price VARCHAR(255), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
//   if (err) throw err;
//   console.log("Table plans created");
// });

// db.query(`INSERT INTO data_types(name, network_name) VALUES('Coporate gifting', 'GLO') `, async (err, result) => {
//   if (err) throw err;
//   console.log('Data entered successfully');
// });

// db.query(`INSERT INTO data_plans(id, name, price, network_name, data_type) VALUES(3, '1 gb', '284', 'Airtel', 'Coporate gifting')`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
// });

// db.query(`ALTER TABLE networks ADD id INT`, (err, result) => {
//   if (err) throw err;
//   console.log('Updated');
// });
 

//User account details
db.query(`CREATE TABLE IF NOT EXISTS userBankDetails1(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(20), acctNo VARCHAR(255), acctName VARCHAR(255), bankName VARCHAR(255), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
    if (err) throw err;
    console.log("BANK CREATED");
  });
//Route to register user
app.post("/register", async (req, res) => {
  const { password, username, email } = req.body;

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

        const sql = `INSERT INTO users (user_pass, username, user_email) VALUES (?, ?, ?);`;

        db.query(sql, [hashedPassword, username, email], (err, result) => {
          if (err) {
            console.error("Error registering user", err);
            return res.status(401).json({ message: "Error inserting user" });
          }
          return res
            .status(200)
            .json({ message: "User registered successfully" });
        });
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
        return res
          .status(401)
          .json({
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

//Fetch data network
app.get("/network", (req, res) => {
  const sql = `SELECT * FROM networks WHERE is_active = 'active'`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server unavailable" });
    }
    res.status(200).json(result);
  });
});

//Fetch data plan type
app.post("/data/types", (req, res) => {
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

//Fetch data plans
app.post("/data/plans", (req, res) => {
  const { choosenNetwork, choosenDataType } = req.body;
  const sql = `SELECT * FROM data_plans WHERE network_name = ? AND is_active = 'active' AND data_type = ?`;
  db.query(sql, [choosenNetwork, choosenDataType], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ Error: "Failed to select data type" });
    }
    res.status(200).json(result);
  });
});

//Fetch data from API
app.post("/api/data=bundle", async (req, res) => {
  const { DataPrice, mobileNumber, choosenNetwork } = req.body;
  try {
    const sql = `SELECT * FROM data_plans WHERE price = ? AND is_active = 'active'`;
    db.query(sql, [DataPrice], async (err, result) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Data query error" });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: "Plan not founf" });
      }
      db.query(
        `SELECT id FROM networks WHERE name = ?`,
        [choosenNetwork],
        async (err, results) => {
          if (err) {
            return res.status(500).json({ error: "Field to select network" });
          }
          const networkId = results[0].id;

          const id = result[0].id;

          const requestBody = {
            network: networkId,
            mobile_number: mobileNumber,
            plan: id,
            Ported_number: true,
          };

          const headers = {
            Authorization: process.env.API_TOKEN,
            "Content-Type": "application/json",
          };

          try {
            const response = await axios.post(
              "https://alrahuzdata.com.ng/api/data/",
              requestBody,
              { headers }
            );
            res.status(200).json(response.data);
          } catch (err) {
            console.error(
              "Failed to fetch from API",
              err.response?.data || err.message
            );
            res
              .status(500)
              .json({ error: "Failed to fetch data from external API" });
          }
        }
      );
    });
  } catch (err) {
    console.error("Server error", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

//Airtime section
//Create Airtime network table
const sql = `CREATE TABLE IF NOT EXISTS AirtimeN(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active', id INT)`;
db.query(sql, (err, result) => {
  if (err) throw err;
  console.log("Airtime network Table created");
});

//Insert into Airtime network table
// db.query(`INSERT INTO AirtimeN(name, id) VALUES('GLO', 2)`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
// });

//Create Airtime type table
const AirtimeT = `CREATE TABLE IF NOT EXISTS AirtimeT(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active')`;
db.query(AirtimeT, (err, result) => {
  if (err) throw err;
  console.log("Airtime Type Table created");
});

//Insert into Airtime type table
// db.query(`INSERT INTO AirtimeT(name) VALUES('VTU')`, (err, result) => {
//   if (err) throw err;
//   console.log('Inserted');
// });

//Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
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
//Protected route
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Authorized" });
});

// Fetch Airtime network
app.get("/api/airtimeN", (req, res) => {
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
app.get("/api/airtimeT", (req, res) => {
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
app.post("/api/airtime/topup", async (req, res) => {
  const { airtimeNChoosen, airtimeTChoosen, mobileN, amount } = req.body;
  const airtimeBody = {
    network: airtimeNChoosen,
    amount: amount,
    mobile_number: mobileN,
    Ported_number: true,
    airtime_type: airtimeTChoosen,
  };

  const headers = {
    Authorization: process.env.API_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(
      "https://alrahuzdata.com.ng/api/topup/",
      airtimeBody,
      { headers }
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch Airtime from external API" });
  }
});

const { MON_API_KEY, MON_SECRET_KEY, MON_CONTRACT_CODE, MON_BASE_URL } = process.env;
const credentials = Buffer.from(`${MON_API_KEY}:${MON_SECRET_KEY}`).toString('base64');

const authenticate = async () => {
  const response = await axios.post(
    `${MON_BASE_URL}/api/v1/auth/login`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
    }
  );
  return response.data.responseBody.accessToken;
};
//Payment connection
app.post("/dedicated/account", authenticateToken, async (req, res) => {
  
  //Create dedicated account number
  const userid = req.user.id;
  console.log(userid);
  try {
    const token = await authenticate();


    const response = await axios.post(
      `${MON_BASE_URL}/api/v1/bank-transfer/reserved-accounts`,
      {
        'accountReference': `${userid}`,
        'accountName': "Banky",
        'currencyCode': "NGN",
        'contractCode': MON_CONTRACT_CODE,
        'customerEmail': "bankoleazeezb98@gmail.com",
        'nin': '46182096878',
        'customerName': "Bank",
        'getAllAvailableBanks': true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(response.data);
    console.log(response.data.responseBody);
    const acctNo = response.data.responseBody.accountNumber;
    const acctName = response.data.responseBody.accountName;
    const bankName = response.data.responseBody.bankName;
    const refrence = response.data.responseBody.accountRefrence;
    const sql = `INSERT INTO userBankDetails1 (id, acctNo, acctName, bankName) VALUES (?, ?, ?, ?)`;
    db.query(sql, [refrence, acctNo, acctName, bankName], (err, result) => {
      if (err) {
        console.log('Error inserting bank details')
        return res.status(500).json({message: 'Error inserting bank details'});
      }
      console.log('Bank details innserted');
    })
    return response.data.responseBody;
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
});

//Select user bank details
app.post('/api/user_account', authenticateToken, (req, res) => {
  const userid = req.user.id;
const sql = `SELECT * FROM userBankDetails1 WHERE id = ? AND is_active = 'active'`;
db.query(sql, [userid], (err, result) => {
  if (err) {
    console.error(err)
    return res.status(500).json({message: 'Error selecting user bank details'})
  }
  if (result.length === 0) {
    return res.status(404).json({message: 'No details found'})
  }
  res.status(200).json(result);
});
});

//Select user details
app.get('/api/user_info', authenticateToken, (req, res) => {
  const userid = req.user.id;
  const sql = `SELECT username, user_balance FROM users WHERE d_id = ?`;
  db.query(sql, [userid], (err, result) => {
    if (err) {
      return res.status(500).json({message: 'Error selecting user'});
    }
    if (result.length === 0) {
      return res.status(404).json({message: 'User not found'});
    }
    res.status(200).json(result)
  });
});

//Payment webhook
app.post('/monnify/webhook', (req, res) => {
  const payload = req.body;
  console.log(payload);
  res.status(200).send('Webhook proccessed')
});


//Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "logout successfully" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
