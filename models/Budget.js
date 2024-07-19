const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    startDate: {
        type: String, // Using String for consistency with endDate
        required: true
    },
    endDate: {
        type: String, // Using String to store date as string
        required: true
    },
    remainingDays: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: String
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
