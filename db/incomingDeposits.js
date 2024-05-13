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

// createIncomingFund
async function createIncomingFund(details) {
    const { user_id, amount, source, received_date = new Date() } = details;
    const encryptedAmount = encrypt(amount.toString()); // Encrypt amount

    try {
        const result = await client.query(`
            INSERT INTO incoming_deposits(user_id, amount, source, received_date)
            VALUES($1, $2, $3, $4)
            RETURNING *;
        `, [user_id, encryptedAmount, source, received_date]);
        return result.rows[0];
    } catch (error) {
        console.error('Failed to create incoming fund:', error);
        throw error;
    }
};

// getIncomingFundById
async function getIncomingFundById(id) {
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE id = $1;
        `, [id]);
        if (result.rows.length) {
            result.rows[0].amount = decrypt(result.rows[0].amount);
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error('Failed to retrieve incoming fund:', error);
        throw error;
    }
};

// getIncomingFundsByUserId
async function getIncomingFundsByUserId(userId) {
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE user_id = $1;
        `, [userId]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds for user ID ${userId}: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmount
async function getIncomingFundsByAmount(amount) {
    const encryptedAmount = encrypt(amount.toString());
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE amount = $1;
        `, [encryptedAmount]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds by amount: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmountAbove
async function getIncomingFundsByAmountAbove(amount) {
    const encryptedAmount = encrypt(amount.toString());
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE amount > $1;
        `, [encryptedAmount]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds above amount: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmountBelow
async function getIncomingFundsByAmountBelow(amount) {
    const encryptedAmount = encrypt(amount.toString());
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE amount < $1;
        `, [encryptedAmount]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds below amount: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmountBetween
async function getIncomingFundsByAmountBetween(minAmount, maxAmount) {
    const encryptedMinAmount = encrypt(minAmount.toString());
    const encryptedMaxAmount = encrypt(maxAmount.toString());
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE amount >= $1 AND amount <= $2;
        `, [encryptedMinAmount, encryptedMaxAmount]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds between amounts: ${error}`);
        throw error;
    }
};

// getIncomingFundsBySource
async function getIncomingFundsBySource(source) {
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE source = $1;
        `, [source]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds by source: ${error}`);
        throw error;
    }
};

// getIncomingFundsBeforeDate
async function getIncomingFundsBeforeDate(date) {
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE received_date < $1;
        `, [date]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds before date: ${error}`);
        throw error;
    }
};

// getIncomingFundsAfterDate
async function getIncomingFundsAfterDate(date) {
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE received_date > $1;
        `, [date]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds after date: ${error}`);
        throw error;
    }
};

// getIncomingFundsBetweenDates
async function getIncomingFundsBetweenDates(startDate, endDate) {
    try {
        const result = await client.query(`
            SELECT *
            FROM incoming_deposits
            WHERE received_date BETWEEN $1 AND $2;
        `, [startDate, endDate]);
        result.rows.forEach(row => row.amount = decrypt(row.amount));
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds between dates: ${error}`);
        throw error;
    }
};

// updateIncomingFund
async function updateIncomingFund(id, updates) {
    const setClauses = [];
    const values = [];
    let index = 1;

    if (updates.amount !== undefined) {
        updates.amount = encrypt(updates.amount.toString());
        setClauses.push(`amount = $${index}`);
        values.push(updates.amount);
        index++;
    }
    if (updates.source !== undefined) {
        setClauses.push(`source = $${index}`);
        values.push(updates.source);
        index++;
    }
    if (updates.received_date !== undefined) {
        setClauses.push(`received_date = $${index}`);
        values.push(updates.received_date);
        index++;
    }

    if (setClauses.length === 0) {
        console.log("No updates provided.");
        return null;
    }

    values.push(id);

    try {
        const result = await client.query(`
            UPDATE incoming_deposits
            SET ${setClauses.join(', ')}
            WHERE id = $${index}
            RETURNING *;
        `, values);
        if (result.rows.length) {
            console.log(`Incoming fund with ID ${id} updated successfully.`);
            result.rows[0].amount = decrypt(result.rows[0].amount);
            return result.rows[0];
        } else {
            console.log(`Incoming fund with ID ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to update incoming fund with ID ${id}: ${error}`);
        throw error;
    }
};

// deleteIncomingFund
async function deleteIncomingFund(id) {
    try {
        const result = await client.query(`
            DELETE FROM incoming_deposits WHERE id = $1 RETURNING *;
        `, [id]);
        if (result.rows.length) {
            console.log(`Incoming fund with ID ${id} deleted successfully.`);
            result.rows[0].amount = decrypt(result.rows[0].amount);
            return result.rows[0];
        } else {
            console.log(`Incoming fund with ID ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to delete incoming fund with ID ${id}: ${error}`);
        throw error;
    }
};

module.exports = {
    createIncomingFund,
    getIncomingFundById,
    getIncomingFundsByUserId,
    getIncomingFundsByAmount,
    getIncomingFundsByAmountAbove,
    getIncomingFundsByAmountBelow,
    getIncomingFundsByAmountBetween,
    getIncomingFundsBySource,
    getIncomingFundsBeforeDate,
    getIncomingFundsAfterDate,
    getIncomingFundsBetweenDates,
    updateIncomingFund,
    deleteIncomingFund
};
