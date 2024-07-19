const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, ref: 'User' 
    },
    name: {
        type: String, required: true 
    },
    targetAmount: { 
        type: Number, required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    targetDate: { 
        type: String, 
        required: true 
    },
    currentAmount: { 
        type: Number, 
        default: 0 },
    description: { 
        type: String 
    },
},);

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
