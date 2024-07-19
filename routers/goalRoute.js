const express = require('express');
const Goal = require('../models/Goal');
const router = express.Router();

// Route to add a new goal
router.post('/add_goal', async (req, res) => {
    try {
        const newGoal = new Goal(req.body);
        await newGoal.save();
        res.status(201).send('Goal created successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to get all goals for a user
router.get('/get-all-goals', async (req, res) => {
    try {
        const userId = req.query.userId;
        const goals = await Goal.find({ userId: userId });
        res.send(goals);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to edit an existing goal
router.post('/edit_goal', async (req, res) => {
    try {
        const userId = req.body.userId;
        const goalId = req.body.goalId;

        const updatePayload = {
            name: req.body.name,
            targetAmount: req.body.targetAmount,
            category: req.body.category,
            targetDate: req.body.targetDate,
            description: req.body.description,
        };

        await Goal.findOneAndUpdate({ _id: goalId, userId: userId }, updatePayload, { new: true });
        res.send('Goal updated successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete an existing goal
router.post('/delete_goal', async (req, res) => {
    try {
        const goalId = req.body.goalId;
        await Goal.findOneAndDelete({ _id: goalId });
        res.send('Goal deleted successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to add money to an existing goal
router.post('/add_money', async (req, res) => {
    try {
        const { goalId, amount } = req.body;
        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).send('Goal not found');
        }
        goal.currentAmount += amount;
        await goal.save();
        res.send('Money added to goal successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
