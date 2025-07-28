import express from 'express';
import db from '../../config/database.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

//User account details
// db.execute(
//   `CREATE TABLE IF NOT EXISTS userBankDetails1(d_id INT PRIMARY KEY AUTO_INCREMENT, id INT, name VARCHAR(20), acctNo VARCHAR(255), acctName VARCHAR(255), bankName VARCHAR(255), is_active ENUM('active', 'disabled') DEFAULT 'active')`,
//   async (err, result) => {
//     if (err) throw err;
//     console.log("BANK CREATED");
//   }
// );


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


//Payment connection
router.post("/dedicated/account", async (req, res) => {
  //Create dedicated account number
  const userid = req.user.id;
  try {
    const token = await authenticate();
    const randomRef = Math.floor(1000 + Math.random() * 9000);

    const userD = `SELECT username, user_email, nin FROM users WHERE d_id = ?`;
    db.query(userD, [userid], async (err, userDetails) => {
      if (err || userDetails.length === 0) {
        console.log("Unable to select user details", err);
        return res
          .status(500)
          .json({ message: "Unable to select user details" });
      }

      const userDetail = userDetails[0];

      if (userDetail.nin.length < 11) {
        console.log('Invalid NIN Number');
        return res.status(400).json({ message: 'NIN cannot be empty, submit your NIN' });
      }

      const response = await axios.post(
        `${MON_BASE_URL}/api/v1/bank-transfer/reserved-accounts`,
        {
          accountReference: `${randomRef}_${userid}`,
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
      const refrence = response.data.responseBody.accountReference;

      const sql = `INSERT INTO userBankDetails1 (id, acctNo, acctName, bankName, acct_id) VALUES (?, ?, ?, ?, ?)`;
      db.query(
        sql,
        [userid, acctNo, acctName, bankName, refrence,],
        (err, result) => {
          if (err) {
            console.log("Error inserting bank details", err);
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
    console.error(err.response?.data || err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;