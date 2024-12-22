import mysql from "mysql2";
import express from "express";
import dotenv from "dotenv";
//import nodemailer from "nodemailer";
import cors from "cors";
//import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
//import JWT from 'jsonwebtoken';
//import multer from 'multer';
import axios from "axios";

const port = process.env.PORT || 3006;

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true)
  },
  method: ['POST', 'GET', 'DELETE', 'PUT'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
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


// db.(`CREATE TABLE IF NOT EXISTS networks(d_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(10), is_active ENUM('active', 'disabled') DEFAULT 'active')`, async (err, result) => {
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

//Fetch data network
app.get('/network', (req, res) => {
    const sql = `SELECT * FROM networks WHERE is_active = 'active'`;
     db.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({message: 'Server unavailable'});
      }
      res.status(200).json(result);
    });
});

//Fetch data plan type
app.post('/data/types', (req, res) => {
  const { choosenNetwork } = req.body;
  const sql =   `SELECT * FROM data_types WHERE network_name = ? AND is_active = 'active'`;
  db.query(sql, [choosenNetwork], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({Error: 'Failed to select network'});
    }
    res.status(200).json(result);
  });
});

//Fetch data plans
app.post('/data/plans', (req, res) => {
  const { choosenNetwork, choosenDataType } = req.body;
  const sql =   `SELECT * FROM data_plans WHERE network_name = ? AND is_active = 'active' AND data_type = ?`;
  db.query(sql, [choosenNetwork, choosenDataType], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({Error: 'Failed to select data type'});
    }
    res.status(200).json(result);
  });
});

//Fetch data from API
app.post('/api/data=bundle', async (req, res) => {
  
  const { DataPrice, mobileNumber, choosenNetwork } = req.body;
  try {
  const sql = `SELECT * FROM data_plans WHERE price = ? AND is_active = 'active'`;
  db.query(sql, [DataPrice], async (err, result) => {
    if (err) {
      console.error(err.message)
      return res.status(500).json({error: 'Data query error'})
    }
    if (result.length === 0) {
      return res.status(404).json({error: 'Plan not founf'});
    }
      
    const id  = result[0].id

    const requestBody = {
      'network': choosenNetwork,
      'mobile_number': mobileNumber,
      'plan': id,
      'Ported_number': true,
    };

    const headers = {
      Authorization: process.env.API_TOKEN,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post('https://alrahuzdata.com.ng/api/data/', requestBody, {headers});
      res.status(200).json(response.data);
    } catch (err) {
      console.error("Failed to fetch from API", err.response?.data || err.message);
      res.status(500).json({error: 'Failed to fetch data from external API'});
    }
  });

  } catch (err) {
    console.error('Server error', err.message);
    res.status(500).json({error: 'Server error'});
  }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});