// Requires
require("dotenv").config();
const express = require("express");
const apiRouter = express.Router();
const jwt = require('jsonwebtoken');
const { getUserById } = require("../db/users");
const JWT_SECRET = process.env.JWT_SECRET

// JWT Middleware
apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    console.log("Req.header on indexAPI.", req.header('Authorization'))

    // No authoriation
    if (!auth) {
        console.log("No auth!")
        next();

        // Authorization, so check for auth header 'Bearer'
    } else if (auth) {
        const token = auth.slice(prefix.length); // Get token from auth header
        console.log("We have Auth.", token)

        // Verify JWT token
        try {
            const parsedToken = await jwt.verify(token, JWT_SECRET);
            console.log("Parsed Token", parsedToken)
            const id = parsedToken && parsedToken.id // Get id from parsed token
            if (id) { 
                console.log('We have id!')
                req.user = await getUserById(id); // From DB
                console.log("id & req.user", id, req.users)
                next();
            }
        } catch (error) {
            console.log(error);
            next({
                name: 'JsonWebTokenError',
                message: 'JWT verification failed!'
            });
        }

    // Auth header does not start with 'Bearer '
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        });
    }
});

// Handle GET request to '/api'
apiRouter.get("/", (req, res) => {
    res.json({message: 'API is running.'});
});

// General error handling
apiRouter.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send({ message: error.message });
});

// Routers
const {accountsRouter} = require('./accounts');
const {distributionRulesRouter} = require('./distributionRules');
const {incomingDepositsRouter} = require('./incomingDeposits');
const {transactionsRouter} = require('./transactions');
const {usersRouter} = require('./users');
apiRouter.use('/accounts', accountsRouter);
apiRouter.use('/distributionrules', distributionRulesRouter);
apiRouter.use('/incomingDeposits', incomingDepositsRouter);
apiRouter.use('/transactions', transactionsRouter);
apiRouter.use('/users', usersRouter);

// Export
module.exports = { apiRouter }