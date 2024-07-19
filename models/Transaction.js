const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }, // Reference to the goal
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);

module.exports = TransactionModel;
