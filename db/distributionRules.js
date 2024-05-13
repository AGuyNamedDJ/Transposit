// Requires
const { client } = require("./index");
require('dotenv').config();
const validator = require('validator');

// Validation Functions
function validatePercentage(percentage) {
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
        throw new Error('Invalid percentage. Must be a number between 0 and 100.');
    }
};

// createDistributionRule
async function createDistributionRule(ruleDetails) {
    const { user_id, account_id, percentage } = ruleDetails;

    // Validate input
    validatePercentage(percentage);

    try {
        const result = await client.query(`
            INSERT INTO distribution_rules(user_id, account_id, percentage)
            VALUES($1, $2, $3)
            RETURNING *;
        `, [user_id, account_id, percentage]);
        console.log(`Distribution rule created successfully for user ID ${user_id}`);
        return result.rows[0];
    } catch (error) {
        console.error(`Failed to create distribution rule for user ID ${user_id}: ${error}`);
        throw error;
    }
};

// getRuleById
async function getRuleById(ruleId) {
    try {
        const result = await client.query(`
            SELECT * FROM distribution_rules WHERE id = $1;
        `, [ruleId]);
        if (result.rows.length) {
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error(`Failed to retrieve distribution rule by ID ${ruleId}: ${error}`);
        throw error;
    }
};

// getRulesByUserId
async function getRulesByUserId(userId) {
    try {
        const result = await client.query(`
            SELECT * FROM distribution_rules WHERE user_id = $1;
        `, [userId]);
        return result.rows;
    } catch (error) {
        console.error(`Failed to retrieve distribution rules for user ID ${userId}: ${error}`);
        throw error;
    }
};

// updateRule
async function updateRule(ruleId, updates) {
    const setClauses = [];
    const values = [];
    let index = 1;

    if (updates.percentage !== undefined) {
        validatePercentage(updates.percentage);
        setClauses.push(`percentage = $${index}`);
        values.push(updates.percentage);
        index++;
    }
    if (updates.account_id !== undefined) {
        setClauses.push(`account_id = $${index}`);
        values.push(updates.account_id);
        index++;
    }

    if (setClauses.length === 0) {
        console.log("No updates provided.");
        return null;
    }

    values.push(ruleId);

    try {
        const result = await client.query(`
            UPDATE distribution_rules
            SET ${setClauses.join(', ')}
            WHERE id = $${index}
            RETURNING *;
        `, values);
        if (result.rows.length) {
            console.log(`Distribution rule with ID ${ruleId} updated successfully.`);
            return result.rows[0];
        } else {
            console.log(`Distribution rule with ID ${ruleId} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to update distribution rule with ID ${ruleId}: ${error}`);
        throw error;
    }
};

// deleteRule
async function deleteRule(ruleId) {
    try {
        const result = await client.query(`
            DELETE FROM distribution_rules WHERE id = $1 RETURNING *;
        `, [ruleId]);
        if (result.rows.length) {
            console.log(`Distribution rule with ID ${ruleId} deleted successfully.`);
            return result.rows[0];
        } else {
            console.log(`Distribution rule with ID ${ruleId} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to delete distribution rule with ID ${ruleId}: ${error}`);
        throw error;
    }
};

module.exports = {
    createDistributionRule,
    getRuleById,
    getRulesByUserId,
    updateRule,
    deleteRule
};
