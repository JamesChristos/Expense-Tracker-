const express = require('express');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const router = express.Router();
const moment = require('moment');

router.post('/add-transaction', async function (req, res) {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();

        if (newTransaction.goalId) {
            const goal = await Goal.findById(newTransaction.goalId);
            if (goal) {
                goal.currentAmount += newTransaction.amount;
                await goal.save();
            }
        }

        res.send('Transaction added successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/edit-transaction', async function (req, res) {
    try {
        await Transaction.findOneAndUpdate({_id: req.body.transactionId}, req.body.payload);
        res.send('Transaction updated successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/delete-transaction', async function (req, res) {
    try {
        const transaction = await Transaction.findById(req.body.transactionId);

        if (transaction.goalId) {
            const goal = await Goal.findById(transaction.goalId);
            if (goal) {
                goal.currentAmount -= transaction.amount;
                await goal.save();
            }
        }

        await Transaction.findOneAndDelete({ _id: req.body.transactionId });
        res.send('Transaction deleted successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/get-current-amount/:goalId', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.goalId);
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json({ currentAmount: goal.currentAmount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/get-all-transactions', async (req, res) => {
    const { frequency, selectRange, type } = req.body;
    try {
        const transactions = await Transaction.find({
            ...(frequency !== 'custom' ? 
            {
                date: {
                    $gt: moment().subtract(req.body.frequency, 'days').toISOString(),
                },
            } : {
                date: {
                    $gt: moment(selectRange[0]).toISOString(),
                    $lt: moment(selectRange[1]).toISOString(),
                }
            }),
            userid: req.body.userid,
            ...(type !== 'all' && {type})
        });
        res.send(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/total-spent/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const totalSpent = await Transaction.aggregate([
            { $match: { userid: userId, type: 'Expense' } },
            { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } }
        ]);
        res.json(totalSpent);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to get only income transactions for a user
router.get('/get-income-transactions', async (req, res) => {
    try {
        const userId = req.query.userId;
        const incomeTransactions = await Transaction.find({ userid: userId, type: 'Income' });
        const expenseTransactions = await Transaction.find({ userid: userId, type: 'Expense' });
        const totalIncome = incomeTransactions.reduce((total, transaction) => total + transaction.amount, 0);
        const totalExpenses = expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
        const availableIncome = totalIncome - totalExpenses;
        res.send({ availableIncome });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
});



module.exports = router;
