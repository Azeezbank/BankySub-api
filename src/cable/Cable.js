import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../uttilis/encrypt.js';
const prisma = new PrismaClient();
const router = express.Router();

// Fetch Providers
router.get('/provider', async (req, res) => {
    try {
        const provider = await prisma.cable.findMany({
            where: { is_active: 'active' }, select: {
                d_id: true,
                id: true,
                provider: true
            }
        });
        if (provider.length === 0) {
            console.error('No provider found');
            return res.status(404).json({ message: 'No provider found' });
        }
        res.status(200).json(provider);
    } catch (err) {
        console.error('Failed to select cable provioder', err);
        return res.status(500).json({ message: 'Failed to select cable provioder' });
    }
});


//Fetch cable plans
router.post('/plan', async (req, res) => {
    const provider = req.body.provider;
    const userId = req.user.id;

    try {
        const user = await prisma.users.findUnique({
            where: {
                d_id: userId,
            }, select: {
                d_id: true,
                id: true,
                packages: true
            }
        });

        if (!user) {
            console.log('No user found');
            return res.status(404).json({ message: 'User not found' });
        }

        //Select user packages to know price
        const level = user.packages;

        let price = '';
        if (level === 'USER') {
            price = 'user_price'
        } else if (level === 'RESELLER') {
            price = 'reseller_price'
        } else if (level === 'API') {
            price = 'api_price'
        } else {
            console.log('No package found')
        };

        const plan = await prisma.cablePlan.findMany({
            where: { is_active: 'active', provider: provider },
            select: {
                d_id: true,
                cable_name: true,
                [price]: true,
            }
        });

        res.status(200).json(plan);
    } catch (err) {
        console.error('Failed to select cable plan', err);
        return res.status(500).json({ message: 'failed to select cable plan' });
    }
});

//Purchase Cable subscription
router.post('/subscription', async (req, res) => {
    const { provider, cable_name, amount, number, customerName } = req.body;
    const userId = req.user.id;
    try {
        const user = await prisma.users.findUnique({ where: {
            d_id: userId
        }, select: { user_balance: true}});

        if (parseFloat(amount) > parseFloat(user.user_balance)) {
            console.log('Low wallet balnce, Please found your wallet');
            return res.status(400).json({ message: 'Low wallet balnce, Please found your wallet'});
        }

        //Deduct for payment
        await prisma.users.update({  where: {d_id: userId}, 
        data: {prev_balance: {increment: amount}, user_balance: { decrement: amount}}});

        const ApiDocs = await prisma.env.findFirst({ where: {service_type: provider}, select: {api_key: true, api_url: true}});
        const decryptApi_key = decrypt(ApiDocs.api_key);

        //Request Number
        const requestBody = {
            cable_id: provider,
            cable_number: number,
            cable_plan: cable_name,
            bypass: true
        };

        //Request Headerm
        const header = {
            Authorization: decryptApi_key,
            'Content-Type': 'application/json'
        }

        //Fetch cable from API
        const response = await axios.post(ApiDocs.api_url, requestBody, { headers: header });
        const status = response.data.status ?? response.data.Status;

        //Refund user if failed
        if (!response || status === 'fail' || status === 'Fail' || status === 'Failed' || status === 'failed' || status >= 400) {
            await prisma.users.update({ where: {d_id: userId}, data: { prev_balance: {decrement: amount}, user_balance: { increment: amount}}});
            return res.status(400).json({ message: 'Something went wrong'});
        }

        //Insert into cable history
        await prisma.cableHist.create({ data: {id: userId, providername: provider, cable_name: cable_name, amount: amount, customerName: customerName}});
        
        //Reward with cashback
        const cashback = (0.2 / 100) * amount;

        await prisma.users.update({ where: {d_id: userId}, data: {cashback: {increment: cashback}}});

        res.status(200).json({message: 'Cable subscription Successful'})
    } catch (err) {
        console.error('Cable subscription Failed', err);
        return res.status(500).json({message: 'Something went wrong'})
    }
});


export default router;