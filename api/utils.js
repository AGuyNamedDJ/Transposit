// Requires
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserById } = require('../db/users');

const { JWT_SECRET } = process.env;

// Authenticate Middleware
async function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized: No token provided!' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = await getUserById(user.id);
        next();
    } catch (error) {
        return res.status(403).send({ message: 'Forbidden: Invalid token!' });
    }
};

module.exports = {
    authenticateUser
};