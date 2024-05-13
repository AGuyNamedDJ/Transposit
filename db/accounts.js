// Requires
const { client } = require("./index");
const bcrypt = require('bcrypt')
const validator = require('validator');
const crypto = require('crypto');
require('dotenv').config(); 

const encryptionKey = process.env.ENCRYPTION_KEY; 

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// Validation Functions
function validateAccountType(type) {
    if (typeof type !== 'string' || !['savings', 'checking', 'investment'].includes(type.toLowerCase())) {
        throw new Error('Invalid account type. Must be one of "savings", "checking", or "investment".');
    }
};

function validateAccountName(name) {
    if (typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Invalid account name. Must not be empty.');
    }
};

function validateAccountNumber(number) {
    if (typeof number !== 'string' || number.trim().length < 8 || number.trim().length > 12) {
        throw new Error('Invalid account number. Must be between 8 and 12 characters long.');
    }
};

function validateRoutingNumber(number) {
    if (typeof number !== 'string' || number.trim().length !== 9 || !/^\d+$/.test(number)) {
        throw new Error('Invalid routing number. Must be exactly 9 digits.');
    }
};

// createAccount
async function createAccount(userId, accountDetails) {
    const { account_type, account_name, account_number, routing_number } = accountDetails;

    // Validate input
    validateAccountType(account_type);
    validateAccountName(account_name);
    validateAccountNumber(account_number);
    validateRoutingNumber(routing_number);

    // Encrypt account number and routing number
    const encryptedAccountNumber = encrypt(account_number);
    const encryptedRoutingNumber = encrypt(routing_number);

    try {
        const result = await client.query(`
            INSERT INTO accounts(user_id, account_type, account_name, account_number, routing_number)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *;
        `, [userId, account_type, account_name, encryptedAccountNumber, encryptedRoutingNumber]);
        console.log(`Account created successfully for user ID ${userId}`);
        return result.rows[0];
    } catch (error) {
        console.error(`Failed to create account for user ID ${userId}: ${error}`);
        throw error;
    }
};

// getAccountById
async function getAccountById(accountId) {
    try {
        const result = await client.query(`
            SELECT * FROM accounts WHERE id = $1;
        `, [accountId]);
        const account = result.rows[0];
        if (account) {
            account.account_number = decrypt(account.account_number);
            account.routing_number = decrypt(account.routing_number);
            return account;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Failed to retrieve account by ID ${accountId}: ${error}`);
        throw error;
    }
};

// getAllAccountsByUserId
async function getAllAccountsByUserId(userId) {
    try {
        const result = await client.query(`
            SELECT * FROM accounts WHERE user_id = $1;
        `, [userId]);
        result.rows.forEach(account => {
            account.account_number = decrypt(account.account_number);
            account.routing_number = decrypt(account.routing_number);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve accounts for user ID ${userId}: ${error}`);
        throw error;
    }
};

// getAccountByAccountNumber
async function getAccountByAccountNumber(accountNumber) {
    const encryptedAccountNumber = encrypt(accountNumber);
    try {
        const result = await client.query(`
            SELECT * FROM accounts WHERE account_number = $1;
        `, [encryptedAccountNumber]);
        if (result.rows.length) {
            const account = result.rows[0];
            account.account_number = decrypt(account.account_number);
            account.routing_number = decrypt(account.routing_number);
            return account;
        } else {
            console.log(`No account found with account number: ${accountNumber}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to retrieve account by account number ${accountNumber}: ${error}`);
        throw new Error("Failed to retrieve account due to a server error!");
    }
};

// getAllAccountsByRoutingNumber
async function getAllAccountsByRoutingNumber(routingNumber) {
    const encryptedRoutingNumber = encrypt(routingNumber);
    try {
        const result = await client.query(`
            SELECT * FROM accounts WHERE routing_number = $1;
        `, [encryptedRoutingNumber]);
        result.rows.forEach(account => {
            account.account_number = decrypt(account.account_number);
            account.routing_number = decrypt(account.routing_number);
        });
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve accounts by routing number ${routingNumber}: ${error}`);
        throw new Error("Failed to retrieve accounts due to a server error!");
    }
};

//updateAccount
async function updateAccount(accountId, updates) {
    const { account_type, account_name, account_number, routing_number } = updates;

    // Validate and encrypt if necessary
    if (account_type) validateAccountType(account_type);
    if (account_name) validateAccountName(account_name);
    if (account_number) {
        validateAccountNumber(account_number);
        updates.account_number = encrypt(account_number);
    }
    if (routing_number) {
        validateRoutingNumber(routing_number);
        updates.routing_number = encrypt(routing_number);
    }

    const fields = { account_type, account_name, account_number, routing_number };
    const setClauses = Object.keys(fields)
        .filter(key => fields[key] !== undefined)
        .map((key, index) => `"${key}"=$${index + 2}`).join(', ');
    const values = Object.values(fields).filter(value => value !== undefined);

    if (!setClauses.length) return null;  // No updates provided

    try {
        const result = await client.query(`
            UPDATE accounts
            SET ${setClauses}
            WHERE id = $1
            RETURNING *;
        `, [accountId, ...values]);
        if (result.rows.length) {
            const account = result.rows[0];
            account.account_number = decrypt(account.account_number);
            account.routing_number = decrypt(account.routing_number);
            return account;
        } else {
            return null; // No account found
        }
    } catch (error) {
        console.error(`Failed to update account ID ${accountId}: ${error}`);
        throw new Error(`Failed to update account due to a server error!`);
    }
};

// deleteAccount
async function deleteAccount(accountId) {
    try {
        const result = await client.query(`
            DELETE FROM accounts WHERE id = $1 RETURNING id;
        `, [accountId]);
        if (result.rows.length) {
            console.log(`Account ID ${accountId} deleted successfully.`);
            return result.rows[0];
        } else {
            console.log(`No account found with ID: ${accountId}`);
            return null; // No account found
        }
    } catch (error) {
        console.error(`Failed to delete account ID ${accountId}: ${error}`);
        throw new Error(`Failed to delete account due to a server error!`);
    }
};

module.exports = {
    createAccount,
    getAccountById,
    getAllAccountsByUserId,
    getAccountByAccountNumber,
    getAllAccountsByRoutingNumber,
    updateAccount,
    deleteAccount
};