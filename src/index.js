import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import JWT from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";
import transporter from "./config/mailer.js";
import db from '../src/config/database.js';
import corsOptions from './config/cors.js';
import auth from './auth/auth.js';
import network from './network/network.js';
import protectedRoutes from './protected/protected.js';
import data from './data/data.js';
import airtime from './airtime/airtime.js';
import monnify from './paymentGateway/monnify/monnify.acct.js';
import user from './user/user.js';
import monnifyWebhook from './paymentGateway/monnify/webhook.js';
import history from './paymentGateway/history.js';
import adminPage from './adminPage/adminSetting.js';
import verification from './adminPage/verification.js';
import transaction from './transaction/webhook.js';
import signout from './logout/logout.js';
import { authenticateToken } from './auth/middleware.js';

const port = process.env.PORT || 3006;

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/api/auth', auth);
app.use('/api/data/network', authenticateToken, network);
app.use('/api/protected', authenticateToken, protectedRoutes);
app.use('/api/data', authenticateToken, data);
app.use('/api/airtime', authenticateToken, airtime);
app.use('/api/monnify', authenticateToken, monnify);
app.use('/api/user', authenticateToken, user);
app.use('/api/monnify/webhook', monnifyWebhook);
app.use('/api/payment/history', authenticateToken, history);
app.use('/api/admin', authenticateToken, adminPage);
app.use('/api/verification', authenticateToken, verification);
app.use('/api/transaction', authenticateToken, transaction);
app.use('/api/logout', authenticateToken, signout);




//Connection port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
