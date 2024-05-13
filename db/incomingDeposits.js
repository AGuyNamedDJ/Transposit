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
async function createIncomingFund(incomingFundDetails) {
    const { user_id, amount, source, received_date = new Date() } = incomingFundDetails;
    const encryptedSource = encrypt(source); // Encrypt source only

    try {
        const result = await client.query(`
            INSERT INTO incoming_deposits(user_id, amount, source, received_date)
            VALUES($1, $2, $3, $4)
            RETURNING *;
        `, [user_id, amount, encryptedSource, received_date]);
        console.log(`Incoming fund created successfully for user ID ${user_id}`);
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
            SELECT * FROM incoming_deposits WHERE id = $1;
        `, [id]);
        if (result.rows.length) {
            result.rows[0].source = decrypt(result.rows[0].source);
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error(`Failed to retrieve incoming fund by ID ${id}: ${error}`);
        throw error;
    }
};

// getIncomingFundsByUserId
async function getIncomingFundsByUserId(userId) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE user_id = $1;
        `, [userId]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds for user ID ${userId}: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmount
async function getIncomingFundsByAmount(amount) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE amount = $1;
        `, [amount]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds by amount ${amount}: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmountAbove
async function getIncomingFundsByAmountAbove(amount) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE amount > $1;
        `, [amount]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds with amount above ${amount}: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmountBelow
async function getIncomingFundsByAmountBelow(amount) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE amount < $1;
        `, [amount]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds with amount below ${amount}: ${error}`);
        throw error;
    }
};

// getIncomingFundsByAmountBetween
async function getIncomingFundsByAmountBetween(minAmount, maxAmount) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE amount BETWEEN $1 AND $2;
        `, [minAmount, maxAmount]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds with amount between ${minAmount} and ${maxAmount}: ${error}`);
        throw error;
    }
};

// getIncomingFundsBySource
async function getIncomingFundsBySource(source) {
    const encryptedSource = encrypt(source);
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE source = $1;
        `, [encryptedSource]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds by source ${source}: ${error}`);
        throw error;
    }
};

// getIncomingFundsBeforeDate
async function getIncomingFundsBeforeDate(date) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE received_date < $1;
        `, [date]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds before date ${date}: ${error}`);
        throw error;
    }
};

// getIncomingFundsAfterDate
async function getIncomingFundsAfterDate(date) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE received_date > $1;
        `, [date]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds after date ${date}: ${error}`);
        throw error;
    }
};

// getIncomingFundsBetweenDates
async function getIncomingFundsBetweenDates(startDate, endDate) {
    try {
        const result = await client.query(`
            SELECT * FROM incoming_deposits WHERE received_date BETWEEN $1 AND $2;
        `, [startDate, endDate]);
        result.rows.forEach(row => {
            row.source = decrypt(row.source);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve incoming funds between dates ${startDate} and ${endDate}: ${error}`);
        throw error;
    }
};

// updateIncomingFund
async function updateIncomingFund(id, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in updates) {
        fields.push(`${key} = $${index}`);
        values.push(updates[key]);
        index++;
    }
    values.push(id);

    const setString = fields.join(', ');

    try {
        const result = await client.query(`
            UPDATE incoming_deposits
            SET ${setString}
            WHERE id = $${index}
            RETURNING *;
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error(`Failed to update incoming fund ${id}: ${error}`);
        throw error;
    }
};

// deleteIncomingFund
async function deleteIncomingFund(id) {
    try {
        const result = await client.query(`
            DELETE FROM incoming_deposits WHERE id = $1 RETURNING *;
        `, [id]);
        return result.rows[0];
    } catch (error) {
        console.error(`Failed to delete incoming fund ${id}: ${error}`);
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