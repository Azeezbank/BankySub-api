import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import  env  from './adminPage/env.js';
import { swaggerSpec } from './config/swagger/swagger.js';
import swaggerUi from 'swagger-ui-express'
import plan from './data/data.js';
import cable from './cable/Cable.js';


const port = process.env.PORT || 3000;

const app = express();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
dotenv.config();
app.use(cookieParser());

app.get("/", (req, res) => res.send("OK"));

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Add this route to serve the raw swagger spec
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


app.use('/api/auth', auth);
app.use('/api/data/network', authenticateToken, network);
app.use('/api/protected', authenticateToken, protectedRoutes);
app.use('/api/data', authenticateToken, data);
app.use('/api/airtime', authenticateToken, airtime);
app.use('/api/cable', authenticateToken, cable);
app.use('/api/monnify/webhook', monnifyWebhook);
app.use('/api/user', authenticateToken, user);
app.use('/api/payment/history', authenticateToken, history);
app.use('/api/admin', authenticateToken, adminPage);
app.use('/api/verification', authenticateToken, verification);
app.use('/api/transaction', authenticateToken, transaction);
app.use('/api/logout', authenticateToken, signout);
app.use('/api/env', authenticateToken, env);
app.use('/api/home/data', plan);
app.use('/api/monnify', authenticateToken, monnify);




//Connection port
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
