import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();


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

export default db;