// Requires
const express = require('express');
const {
    createAccount,
    getAccountById,
    getAllAccountsByUserId,
    getAccountByAccountNumber,
    getAllAccountsByRoutingNumber,
    updateAccount,
    deleteAccount
} = require('../db/accounts');
const { authenticateUser } = require('./utils');

const accountsRouter = express.Router();

// Endpoint to createAccount
accountsRouter.post('/', authenticateUser, async (req, res, next) => {
    const userId = req.user.id;
    const accountDetails = req.body;

    try {
        const account = await createAccount(userId, accountDetails);
        res.status(201).send({ account });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getAccountById
accountsRouter.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const account = await getAccountById(req.params.id);
        if (!account) {
            return res.status(404).send({ message: 'Account not found' });
        }
        res.send({ account });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getAllAccountsByUserId
accountsRouter.get('/user/:userId', authenticateUser, async (req, res, next) => {
    try {
        const accounts = await getAllAccountsByUserId(req.params.userId);
        res.send({ accounts });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getAccountByAccountNumber
accountsRouter.get('/accountNumber/:accountNumber', authenticateUser, async (req, res, next) => {
    try {
        const account = await getAccountByAccountNumber(req.params.accountNumber);
        if (!account) {
            return res.status(404).send({ message: 'Account not found' });
        }
        res.send({ account });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getAllAccountsByRoutingNumber
accountsRouter.get('/routingNumber/:routingNumber', authenticateUser, async (req, res, next) => {
    try {
        const accounts = await getAllAccountsByRoutingNumber(req.params.routingNumber);
        res.send({ accounts });
    } catch (error) {
        next(error);
    }
});

// Endpoint to updateAccount
accountsRouter.put('/:id', authenticateUser, async (req, res, next) => {
    try {
        const account = await updateAccount(req.params.id, req.body);
        if (!account) {
            return res.status(404).send({ message: 'Account not found' });
        }
        res.send({ account });
    } catch (error) {
        next(error);
    }
});

// Endpoint to deleteAccount
accountsRouter.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const account = await deleteAccount(req.params.id);
        if (!account) {
            return res.status(404).send({ message: 'Account not found' });
        }
        res.send({ account });
    } catch (error) {
        next(error);
    }
});

module.exports = { accountsRouter };