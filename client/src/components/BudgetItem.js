import React from 'react';

const BudgetItem = ({ category, spent, total, endDate, remainingDays }) => {
    const isOverSpent = spent > total;
    const overSpentAmount = isOverSpent ? (spent - total).toFixed(2) : 0; // Calculate overspent amount if any
    const progress = Math.min((spent / total) * 100, 100); // Cap progress at 100%

    const progressBarStyle = {
        width: `${progress}%`,
        backgroundColor: isOverSpent ? 'red' : 'green', // Red if overspent, otherwise green
        height: '20px'
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <h4>{category}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>
                    Spent: 
                    {isOverSpent 
                        ? ` Over Spent by $${overSpentAmount}`
                        : `$${spent.toFixed(2)}`}
                </span>
                <span>Total: ${total.toFixed(2)}</span>
            </div>
            <div style={{ backgroundColor: '#ddd', borderRadius: '1px', overflow: 'hidden' }}>
                <div style={progressBarStyle}></div>
            </div>
            <div style={{ marginTop: '10px' }}>
                Remaining days: {remainingDays}
            </div>
        </div>
    );
};

export default BudgetItem;
