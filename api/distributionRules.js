// Requires
const express = require('express');
const {
    createDistributionRule,
    getRuleById,
    getRulesByUserId,
    updateRule,
    deleteRule
} = require('../db/distributionRules');
const { authenticateUser } = require('./utils');

const distributionRulesRouter = express.Router();

// Endpoint to createDistributionRule
distributionRulesRouter.post('/', authenticateUser, async (req, res, next) => {
    const { user_id, account_id, percentage } = req.body;

    try {
        const rule = await createDistributionRule({ user_id, account_id, percentage });
        res.status(201).send({ rule });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getRuleById
distributionRulesRouter.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const rule = await getRuleById(req.params.id);
        if (!rule) {
            return res.status(404).send({ message: 'Rule not found' });
        }
        res.send({ rule });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getRulesByUserId
distributionRulesRouter.get('/user/:userId', authenticateUser, async (req, res, next) => {
    try {
        const rules = await getRulesByUserId(req.params.userId);
        res.send({ rules });
    } catch (error) {
        next(error);
    }
});

// Endpoint to updateRule
distributionRulesRouter.put('/:id', authenticateUser, async (req, res, next) => {
    try {
        const rule = await updateRule(req.params.id, req.body);
        if (!rule) {
            return res.status(404).send({ message: 'Rule not found' });
        }
        res.send({ rule });
    } catch (error) {
        next(error);
    }
});

// Endpoint to deleteRule
distributionRulesRouter.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const rule = await deleteRule(req.params.id);
        if (!rule) {
            return res.status(404).send({ message: 'Rule not found' });
        }
        res.send({ rule });
    } catch (error) {
        next(error);
    }
});

module.exports = { distributionRulesRouter };