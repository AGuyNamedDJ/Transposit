// Requires
const express = require('express');
const {
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
} = require('../db/transactions');
const { authenticateUser } = require('./utils');

const transactionsRouter = express.Router();

// Endpoint to createTransaction
transactionsRouter.post('/', authenticateUser, async (req, res, next) => {
    const { user_id, account_id, amount, status, transaction_date } = req.body;

    try {
        const transaction = await createTransaction({ user_id, account_id, amount, status, transaction_date });
        res.status(201).send({ transaction });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getAllTransactions
transactionsRouter.get('/', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getAllTransactions();
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionById
transactionsRouter.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const transaction = await getTransactionById(req.params.id);
        if (!transaction) {
            return res.status(404).send({ message: 'Transaction not found' });
        }
        res.send({ transaction });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsByUserId
transactionsRouter.get('/user/:userId', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsByUserId(req.params.userId);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsByAccountId
transactionsRouter.get('/account/:accountId', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsByAccountId(req.params.accountId);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsByAmount
transactionsRouter.get('/amount/:amount', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsByAmount(req.params.amount);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsByDate
transactionsRouter.get('/date/:transactionDate', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsByDate(req.params.transactionDate);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsBeforeDate
transactionsRouter.get('/before/:date', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsBeforeDate(req.params.date);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsAfterDate
transactionsRouter.get('/after/:date', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsAfterDate(req.params.date);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsBetweenDates
transactionsRouter.get('/between/:startDate/:endDate', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsBetweenDates(req.params.startDate, req.params.endDate);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getTransactionsByStatus
transactionsRouter.get('/status/:status', authenticateUser, async (req, res, next) => {
    try {
        const transactions = await getTransactionsByStatus(req.params.status);
        res.send({ transactions });
    } catch (error) {
        next(error);
    }
});

module.exports = { transactionsRouter };