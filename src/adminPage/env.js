import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../auth/middleware.js';
import { encrypt } from '../uttilis/encrypt.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


 //export const envTable = () => {
// const sql = `CREATE TABLE IF NOT EXISTS env(id INT AUTO_INCREMENT PRIMARY KEY, service_type VARCHAR(255), api_key VARCHAR(255), api_url VARCHAR(255))`;
// db.execute(sql, (err, result) => {
//     if (err) throw err;
//     console.log('Table env created or already exists');
// })
// };

// db.execute(`ALTER TABLE env CHANGE id d_id INT AUTO_INCREMENT`, (err, result) => {
//     if (err) throw err;
//     console.log('env updated')
// });
//  }


//Update api docs
router.post('/', authenticateToken, (req, res) => {
    const { service_type, api_key, api_url } = req.body;

        const sql = `INSERT INTO env(service_type, api_key, api_url) VALUES (?, ?, ?)`;
        const encryptedApiKey = encrypt(api_key);
        db.execute(sql, [service_type, encryptedApiKey, api_url], (err, result) => {
            if (err) {
                console.error('Failed to insert environmental details', err.message);
                return res.status(500).json({ message: 'Failed to insert environmental details' });
            }

            res.status(200).json({ message: 'API details inserted successfully' });
        })
});

//Fetch API Docs
router.get('/', authenticateToken, (req, res) => {
    const sql = `SELECT d_id, service_type, api_key, api_url FROM env`;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Failed to select API Docs', err.message);
            return res.status(500).json({message: 'Failed to select API Docs'})
        }

        res.status(200).json(result);
    })
})

export default router;