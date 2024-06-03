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

// getAllTransactions
async function getAllTransactions() {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions;
        `);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error('Failed to retrieve all transactions:', error);
        throw error;
    }
};

// getTransactionById
async function getTransactionById(transactionId) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE id = $1;
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

// getTransactionsByUserId
async function getTransactionsByUserId(userId) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE user_id = $1;
        `, [userId]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions for user ID ${userId}: ${error}`);
        throw error;
    }
};

// getTransactionsByAccountId
async function getTransactionsByAccountId(accountId) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE account_id = $1;
        `, [accountId]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions for account ID ${accountId}: ${error}`);
        throw error;
    }
};

// getTransactionsByAmount
async function getTransactionsByAmount(amount) {
    const encryptedAmount = encrypt(amount.toString());
    try {
        const result = await client.query(`
            SELECT * FROM transactions WHERE amount = $1;
        `, [encryptedAmount]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions by amount: ${error}`);
        throw error;
    }
};

// getTransactionsByDate
async function getTransactionsByDate(transactionDate) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE DATE(transaction_date) = DATE($1);
        `, [transactionDate]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions on date ${transactionDate}: ${error}`);
        throw error;
    }
};

// getTransactionsBeforeDate
async function getTransactionsBeforeDate(date) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE transaction_date < $1;
        `, [date]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions before date ${date}: ${error}`);
        throw error;
    }
};

// getTransactionsAfterDate
async function getTransactionsAfterDate(date) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE transaction_date > $1;
        `, [date]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions after date ${date}: ${error}`);
        throw error;
    }
};

// getTransactionsBetweenDates
async function getTransactionsBetweenDates(startDate, endDate) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE transaction_date BETWEEN $1 AND $2;
        `, [startDate, endDate]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions between dates ${startDate} and ${endDate}: ${error}`);
        throw error;
    }
};

// getTransactionsByStatus
async function getTransactionsByStatus(status) {
    try {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE status = $1;
        `, [status]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve transactions with status ${status}: ${error}`);
        throw error;
    }
};

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    getTransactionsByUserId,
    getTransactionsByAccountId,
    getTransactionsByAmount,
    getTransactionsByDate,
    getTransactionsBeforeDate,
    getTransactionsAfterDate, 
    getTransactionsBetweenDates,
    getTransactionsByStatus
};