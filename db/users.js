// Requires
const { client } = require("./index");
const bcrypt = require('bcrypt')
const validator = require('validator');

// Validation FNs
function validateUsername(username) {
    return typeof username === 'string' && username.trim().length >= 3 && username.trim().length <= 30;
};

function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
};

function validateEmail(email) {
    return validator.isEmail(email);
};

// createUser
async function createUser({ username, password, email }) {
    const SALT_COUNT = 10;

    // Validate input
    if (!validateUsername(username)) {
        throw new Error('Invalid username. Must be between 3 and 30 characters.');
    }
    if (!validatePassword(password)) {
        throw new Error('Invalid password. Must be at least 8 characters long.');
    }
    if (!validateEmail(email)) {
        throw new Error('Invalid email format.');
    }

    try {
        console.log(`Hashing password for ${username}`);
        const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
        console.log(`Password hashed for ${username}, inserting into database`);
  
        const result = await client.query(`
            INSERT INTO users(username, password, email) 
            VALUES($1, $2, $3)
            ON CONFLICT (username) DO NOTHING
            RETURNING id, username, email, created_at;
        `, [username, hashedPassword, email]);
  
        const user = result.rows[0];
        if (user) {
            console.log(`User ${username} inserted into database`);
            return user;
        } else {
            console.log(`User creation failed: Username ${username} already exists.`);
            return null; // Return null if user wasn't created due to username conflict
        }
    } catch (error) {
        console.error(`Could not create user ${username}: ${error}`);
        throw error;
    }
};
