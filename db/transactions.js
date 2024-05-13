// Requires
const { client } = require("./index");
require('dotenv').config();
const crypto = require('crypto');

const encryptionKey = process.env.ENCRYPTION_KEY;
const algorithm = 'aes-256-cbc';

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(text.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

function decrypt(text) {
    let textParts = text.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// createTransaction
async function createTransaction(transactionDetails) {
    const { user_id, account_id, amount, status = 'pending', transaction_date = new Date() } = transactionDetails;
    const encryptedAmount = encrypt(amount.toString()); // Encrypt amount

    try {
        const result = await client.query(`
            INSERT INTO transactions(user_id, account_id, amount, status, transaction_date)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *;
        `, [user_id, account_id, encryptedAmount, status, transaction_date]);
        return result.rows[0];
    } catch (error) {
        console.error('Failed to create transaction:', error);
        throw error;
    }
};

// getTransactionById
async function getTransactionById(transactionId) {
    try {
        const result = await client.query(`
            SELECT * FROM transactions WHERE id = $1;
        `, [transactionId]);
        if (result.rows.length) {
            result.rows[0].amount = decrypt(result.rows[0].amount);
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error('Failed to retrieve transaction:', error);
        throw error;
    }
};

module.exports {
    createTransaction,
    getTransactionById

}