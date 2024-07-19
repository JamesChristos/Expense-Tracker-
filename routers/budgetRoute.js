const express = require('express');
const Budget = require('../models/Budget');
const router = express.Router();

// Route to add a new budget
router.post('/add_budgets', async (req, res) => {
    try {
        const newBudget = new Budget(req.body);
        await newBudget.save();
        res.status(201).send('Budget created successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to get all budgets for a user
router.get('/get-all-budgets', async (req, res) => {
    try {
        const userId = req.query.userId;
        const budgets = await Budget.find({ userId: userId });
        res.send(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to edit an existing budget
router.post('/edit_budget', async (req, res) => {
    try {
        const userId = req.body.userId;
        const budgetId = req.body.budgetId;

        const updatePayload = {
            amount: req.body.amount,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            remainingDays: req.body.remainingDays,
            category: req.body.category,
            description: req.body.description,
        };

        await Budget.findOneAndUpdate({ _id: budgetId, userId: userId }, updatePayload, { new: true });
        res.send('Budget updated successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete an existing budget
router.post('/delete_budget', async (req, res) => {
    try {
        const budgetId = req.body.budgetId;
        await Budget.findOneAndDelete({ _id: budgetId });
        res.send('Budget deleted successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
