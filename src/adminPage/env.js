import express from 'express';
import db from '../config/database.js';
import { encrypt, decrypt } from '../uttilis/encrypt.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


// export const envTable = () => {
// const sql = `CREATE TABLE IF NOT EXISTS env(id INT AUTO_INCREMENT PRIMARY KEY, service_type VARCHAR(255), api_key VARCHAR(255), api_url VARCHAR(255))`;
// db.execute(sql, (err, result) => {
//     if (err) throw err;
//     console.log('Table env created or already exists');
// })
// };

// db.execute(`TRUNCATE TABLE env`, (err, result) => {
//     if (err) throw err;
//     console.log('env updated')
// });
//  }


//Update api docs
router.post('/', (req, res) => {
    const { service_type, api_key, api_url } = req.body;

    db.query(`SELECT service_type FROM env WHERE service_type = ?`, [service_type], (err, results) => {
        if (err) {
            console.error('Failed to check service type', err.message);
        }

        const encryptedApiKey = encrypt(api_key);

        if (results.length === 0) {
            const sql = `INSERT INTO env(service_type, api_key, api_url) VALUES (?, ?, ?)`;
            db.execute(sql, [service_type, encryptedApiKey, api_url], (err, result) => {
                if (err) {
                    console.error('Failed to insert environmental details', err.message);
                    return res.status(500).json({ message: 'Failed to insert environmental details' });
                }

                res.status(200).json({ message: 'API details inserted successfully' });
            })
        } else {
            const sql1 = `UPDATE env SET api_key = ?, api_url = ? WHERE service_type = ?`;
            db.execute(sql1, [encryptedApiKey, api_url, service_type], (err, update) => {
                if (err) {
                    console.error('Failed to update api docs', err.message);
                    return res.status(500).json({ message: 'Failed to update api docs' });
                }

                res.status(200).json({ message: 'API Docs updated successfully' });
            })
        }
    })
});

//Fetch API Docs
router.get('/', (req, res) => {
    const sql = `SELECT d_id, service_type, api_key, api_url FROM env`;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Failed to select API Docs', err.message);
            return res.status(500).json({ message: 'Failed to select API Docs' })
        }

        const decryptApiKey = result.map((key) => ({
            ...key,
            api_key: decrypt(key.api_key)
        }));

        res.status(200).json(decryptApiKey);
    });
});

export default router;