// Requires
const express = require('express');
const {
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
} = require('../db/incomingDeposits');
const { authenticateUser } = require('./utils'); 

const incomingDepositsRouter = express.Router();

// Endpoint to createIncomingFund
incomingDepositsRouter.post('/', authenticateUser, async (req, res, next) => {
    const { user_id, amount, source, received_date } = req.body;

    try {
        const fund = await createIncomingFund({ user_id, amount, source, received_date });
        res.status(201).send({ fund });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundById
incomingDepositsRouter.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const fund = await getIncomingFundById(req.params.id);
        if (!fund) {
            return res.status(404).send({ message: 'Fund not found' });
        }
        res.send({ fund });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsByUserId
incomingDepositsRouter.get('/user/:userId', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsByUserId(req.params.userId);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsByAmount
incomingDepositsRouter.get('/amount/:amount', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsByAmount(req.params.amount);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsByAmountAbove
incomingDepositsRouter.get('/amount/above/:amount', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsByAmountAbove(req.params.amount);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsByAmountBelow
incomingDepositsRouter.get('/amount/below/:amount', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsByAmountBelow(req.params.amount);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsByAmountBetween
incomingDepositsRouter.get('/amount/between/:minAmount/:maxAmount', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsByAmountBetween(req.params.minAmount, req.params.maxAmount);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsBySource
incomingDepositsRouter.get('/source/:source', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsBySource(req.params.source);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsBeforeDate
incomingDepositsRouter.get('/before/:date', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsBeforeDate(req.params.date);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsAfterDate
incomingDepositsRouter.get('/after/:date', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsAfterDate(req.params.date);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getIncomingFundsBetweenDates
incomingDepositsRouter.get('/between/:startDate/:endDate', authenticateUser, async (req, res, next) => {
    try {
        const funds = await getIncomingFundsBetweenDates(req.params.startDate, req.params.endDate);
        res.send({ funds });
    } catch (error) {
        next(error);
    }
});

// Endpoint to updateIncomingFund
incomingDepositsRouter.put('/:id', authenticateUser, async (req, res, next) => {
    try {
        const fund = await updateIncomingFund(req.params.id, req.body);
        if (!fund) {
            return res.status(404).send({ message: 'Fund not found' });
        }
        res.send({ fund });
    } catch (error) {
        next(error);
    }
});

// Endpoint to deleteIncomingFund
incomingDepositsRouter.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const fund = await deleteIncomingFund(req.params.id);
        if (!fund) {
            return res.status(404).send({ message: 'Fund not found' });
        }
        res.send({ fund });
    } catch (error) {
        next(error);
    }
});

module.exports = { incomingDepositsRouter };