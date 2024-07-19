import React, { useState, useEffect, useRef } from 'react';
import '../resources/analytics.css';
import { Progress } from 'antd';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns'; // Import the date-fns adapter
import Spinner from '../components/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { faShoppingBasket, faCoffee, faShoppingBag, faHome, faUtensils, faCartShopping, faCar, faSmile, faDollarSign, faLightbulb, faBowlFood, faGlassWater, faShirt, faBaseball, faBaby, faGift, faHomeUser, faBoxesPacking, faToiletPaper, faTruckPlane, faTrainSubway, faCarSide, faGasPump, faBaseballBatBall, faTv, faGamepad, faHospital, faBank, faCreditCard, faMoneyBill, faIdCard, faLandmark, faCoins, faHouseChimneyMedical, faHouseChimneyUser, faBus, faDice, faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';

function Analytics({ transaction }) {
    const [loading, setLoading] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');
        new Chart(ctx, { type: 'line', data: lineChartData, options: lineChartOptions });
    }, []);

    // Get dates and amounts for each income and expense
    const incomeData = transaction
        .filter(item => item.type === 'Income')
        .map(item => ({ date: new Date(item.date), amount: item.amount }));

    const expenseData = transaction
        .filter(item => item.type === 'Expense')
        .map(item => ({ date: new Date(item.date), amount: item.amount }));

    // Sum the amounts for each date
    const incomeDateAmount = {};
    incomeData.forEach(({ date, amount }) => {
        const formattedDate = date.toISOString().split('T')[0]; // Extracting YYYY-MM-DD
        incomeDateAmount[formattedDate] = (incomeDateAmount[formattedDate] || 0) + amount;
    });

    const expenseDateAmount = {};
    expenseData.forEach(({ date, amount }) => {
        const formattedDate = date.toISOString().split('T')[0]; // Extracting YYYY-MM-DD
        expenseDateAmount[formattedDate] = (expenseDateAmount[formattedDate] || 0) + amount;
    });

    // Get unique dates
    const uniqueDates = [...new Set([...Object.keys(incomeDateAmount), ...Object.keys(expenseDateAmount)])];

    // Sort dates in ascending order
    uniqueDates.sort((a, b) => new Date(a) - new Date(b));

    // Get the total amount for each date
    const incomeAmounts = uniqueDates.map(date => incomeDateAmount[date] || 0);
    const expenseAmounts = uniqueDates.map(date => expenseDateAmount[date] || 0);

    // Prepare data for the Line chart
    const lineChartData = {
        labels: uniqueDates.map(date => new Date(date)), // Convert dates to JavaScript Date objects
        datasets: [
            {
                label: 'Income',
                data: incomeAmounts,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)', // 50% transparent blue
                fill: true,
                tension: 0.5,
            },
            {
                label: 'Expense',
                data: expenseAmounts,
                borderColor: 'rgba(231, 76, 60, 1)',
                backgroundColor: 'rgba(231, 76, 60, 0.5)', // 50% transparent red
                fill: true,
                tension: 0.5,
            },
        ],
    };
    

    // Line chart options
    const lineChartOptions = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'MMM dd', // Use 'DD' for formatting days
                    },
                    tooltipFormat: 'MMM dd', // Use 'DD' for formatting days
                },
                title: {
                    display: true,
                    text: 'Date',
                },
                ticks: {
                    source: 'data', // Explicitly use data for ticks
                    autoSkip: false, // Disable automatic skipping of ticks
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Amount',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
            },
        },
    };

    // Group transactions by month and calculate total income and expense for each month
    const monthlyData = transaction.reduce((acc, { type, date, amount }) => {
        const monthYear = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const existingData = acc.find(data => data.monthYear === monthYear);

        if (existingData) {
            if (type === 'Income') {
                existingData.totalIncome += amount;
            } else if (type === 'Expense') {
                existingData.totalExpense += amount;
            }
        } else {
            acc.push({
                monthYear,
                totalIncome: type === 'Income' ? amount : 0,
                totalExpense: type === 'Expense' ? amount : 0,
            });
        }

        return acc;
    }, []);

    // Extract data for the Bar chart
    const barChartLabels = monthlyData.map(data => data.monthYear);
    const barChartIncomeData = monthlyData.map(data => data.totalIncome);
    const barChartExpenseData = monthlyData.map(data => data.totalExpense);

    // Bar chart data
    const barChartData = {
        labels: barChartLabels,
        datasets: [{
                label: 'Income',
                data: barChartIncomeData,
                backgroundColor: 'rgba(54, 162, 235, 0.5)', // 50% transparent blue
                borderColor: 'rgba(54, 162, 235, 1)', // Border color for blue bars
                borderWidth: 1, // Border width
                barThickness: 30, // Increased bar thickness
            },
            {
                label: 'Expense',
                data: barChartExpenseData,
                backgroundColor: 'rgba(231, 76, 60, 0.5)', // 50% transparent red
                borderColor: 'rgba(231, 76, 60, 1)', // Border color for red bars
                borderWidth: 1, // Border width
                barThickness: 30, // Increased bar thickness
            },
        ],
    };  

    // Bar chart options
    const barChartOptions = {
        indexAxis: 'x', // Display bars horizontally
        scales: {
            x: {
                stacked: false, // Remove stacking for x-axis
                title: {
                    display: true,
                    text: 'Months',
                },
            },
            y: {
                stacked: false, // Remove stacking for y-axis
                title: {
                    display: true,
                    text: 'Amount',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
            },
        },
    };


    // Calculate category data for income
    const incomeCategoryData = transaction.reduce((acc, { type, category, amount }) => {
        if (type === 'Income') {
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
        }
        return acc;
    }, {});

    // Extract categories and respective income values for chart display
    const incomeCategories = Object.keys(incomeCategoryData);
    const incomeCategoryValues = incomeCategories.map(category => incomeCategoryData[category]);

    const incomePieChartData = {
        labels: incomeCategories,
        datasets: [{
            data: incomeCategoryValues,
            backgroundColor: [
                'rgba(70, 130, 180, 0.5)',   
                'rgba(255, 69, 0, 0.5)',     
                'rgba(50, 205, 50, 0.5)',    
                'rgba(255, 215, 0, 0.5)',    
                'rgba(199, 21, 133, 0.5)',   
                'rgba(0, 206, 209, 0.5)',    
                'rgba(128, 0, 0, 0.5)',      
                'rgba(75, 0, 130, 0.5)',    
                'rgba(255, 165, 0, 0.5)',    
                'rgba(34, 139, 34, 0.5)',    
                'rgba(255, 20, 147, 0.5)',  
                'rgba(0, 191, 255, 0.5)',    
                'rgba(160, 82, 45, 0.5)',
                'rgba(128, 128, 128, 0.5)',
                'rgba(47, 79, 79, 0.5)',   
            ],
            borderColor: [
                'rgba(70, 130, 180, 1)', 
                'rgba(255, 69, 0, 1)',   
                'rgba(50, 205, 50, 1)',    
                'rgba(255, 215, 0, 1)', 
                'rgba(199, 21, 133, 1)', 
                'rgba(0, 206, 209, 1)',    
                'rgba(128, 0, 0, 1)',    
                'rgba(75, 0, 130, 1)',    
                'rgba(255, 165, 0, 1)',   
                'rgba(34, 139, 34, 1)',    
                'rgba(255, 20, 147, 1)',   
                'rgba(0, 191, 255, 1)',    
                'rgba(160, 82, 45, 1)',    
                'rgba(128, 128, 128, 1)',  
                'rgba(47, 79, 79, 1)',   
            ],
            
            borderWidth: 1,
            hoverOffset: 4,
        }, ],
    };
    
    const incomePieChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    boxWidth: 15, // Adjust legend item size
                },
            },
        },
    };
    

    // Calculate category data for expenses
    const expenseCategoryData = transaction.reduce((acc, { type, category, amount }) => {
        if (type === 'Expense') {
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
        }
        return acc;
    }, {});

    // Extract categories and respective expense values for chart display
    const expenseCategories = Object.keys(expenseCategoryData);
    const expenseCategoryValues = expenseCategories.map(category => expenseCategoryData[category]);

    const expensePieChartData = {
        labels: expenseCategories,
        datasets: [{
            data: expenseCategoryValues,
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1, // Border width
            hoverOffset: 4, // Distance when hovering over a slice
        }, ],
    };
    
    const expensePieChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    boxWidth: 15, // Adjust legend item size
                },
            },
        },
    };
    
    const totalTransaction = transaction.length;
    const totalIncomeTransaction = transaction.filter(item => item.type === 'Income').length;
    const totalExpenseTransaction = transaction.filter(item => item.type === 'Expense').length;

    // Calculate percentages based on lengths of filtered arrays
    const totalIncomeTransactionPercentage = (totalIncomeTransaction / totalTransaction) * 100;
    const totalExpenseTransactionPercentage = (totalExpenseTransaction / totalTransaction) * 100;

    const totalTurnover = transaction.reduce((acc, item) => acc + item.amount, 0)
    const totalIncomeTurnover = transaction.filter(item => item.type === 'Income').reduce((acc, item) => acc + item.amount, 0)
    const totalExpenseTurnover = transaction.filter(item => item.type === 'Expense').reduce((acc, item) => acc + item.amount, 0)
    const totalIncomeTurnoverPercentage = (totalIncomeTurnover / totalTurnover) * 100;
    const totalExpenseTurnoverPercentage = (totalExpenseTurnover / totalTurnover) * 100;

    const linereChartData = uniqueDates.map(date => ({
        date: new Date(date),
        Income: incomeDateAmount[date] || 0,
        Expense: expenseDateAmount[date] || 0,
    }));

    const incomeCategoryIcons = {
        'Food & Drink': <FontAwesomeIcon icon={faUtensils} className='white-icon' />,
        'Restaurants': <FontAwesomeIcon icon={faBowlFood} className='white-icon' />,
        'Coffee & Bars': <FontAwesomeIcon icon={faGlassWater} className='white-icon' />,
        'Groceries': <FontAwesomeIcon icon={faShoppingBasket} className='white-icon' />,
        'Shopping': <FontAwesomeIcon icon={faCartShopping} className='white-icon' />,
        'Clothes & Shoes': <FontAwesomeIcon icon={faShirt} className='white-icon' />,
        'Electronics': <FontAwesomeIcon icon={faLightbulb} className='white-icon' />,
        'Sports': <FontAwesomeIcon icon={faBaseball} className='white-icon' />,
        'Kids': <FontAwesomeIcon icon={faBaby} className='white-icon' />,
        'Gifts': <FontAwesomeIcon icon={faGift} className='white-icon' />,
        'Housing': <FontAwesomeIcon icon={faHome} className='white-icon' />,
        'Mortgage & Rent': <FontAwesomeIcon icon={faHomeUser} className='white-icon' />,
        'Home Supplies': <FontAwesomeIcon icon={faBoxesPacking} className='white-icon' />,
        'Home Services': <FontAwesomeIcon icon={faToiletPaper} className='white-icon' />,
        'Rent the House': <FontAwesomeIcon icon={faHome} className='white-icon' />,
        'Transportation': <FontAwesomeIcon icon={faBus} className='white-icon' />,
        'Business Trips': <FontAwesomeIcon icon={faTruckPlane} className='white-icon' />,
        'Public Transportation': <FontAwesomeIcon icon={faTrainSubway} className='white-icon' />,
        'Family Trips': <FontAwesomeIcon icon={faCar} className='white-icon' />,
        'Vehicle': <FontAwesomeIcon icon={faCarSide} className='white-icon' />,
        'Fuel': <FontAwesomeIcon icon={faGasPump} className='white-icon' />,
        'Service & Parts': <FontAwesomeIcon icon={faCartShopping} className='white-icon' />,
        'Life & Entertainment': <FontAwesomeIcon icon={faSmile} className='white-icon' />,
        'Sports': <FontAwesomeIcon icon={faBaseballBatBall} className='white-icon' />,
        'TV & Netflix': <FontAwesomeIcon icon={faTv} className='white-icon' />,
        'Games': <FontAwesomeIcon icon={faGamepad} className='white-icon' />,
        'Doctor & Healthcare': <FontAwesomeIcon icon={faHospital} className='white-icon' />,
        'Financial Expense': <FontAwesomeIcon icon={faDollarSign} className='white-icon' />,
        'Bank Fee': <FontAwesomeIcon icon={faBank} className='white-icon' />,
        'Interest Payment': <FontAwesomeIcon icon={faCreditCard} className='white-icon' />,
        'Child Support': <FontAwesomeIcon icon={faBaby} className='white-icon' />,
        'Tax': <FontAwesomeIcon icon={faMoneyBill} className='white-icon' />,
        'Insurance': <FontAwesomeIcon icon={faIdCard} className='white-icon' />,
        'Loan': <FontAwesomeIcon icon={faLandmark} className='white-icon' />,
        'Incomes': <FontAwesomeIcon icon={faCoins} className='white-icon' />,
        'Salary': <FontAwesomeIcon icon={faMoneyBill} className='white-icon' />,
        'Rental Income': <FontAwesomeIcon icon={faHouseChimneyUser} className='white-icon' />,
        'Interest': <FontAwesomeIcon icon={faCreditCard} className='white-icon' />,
        'Lottery': <FontAwesomeIcon icon={faDice} className='white-icon' />,
        'Transfer': <FontAwesomeIcon icon={faMoneyBillTransfer} className='white-icon' />,
    };

    // Calculate category data
    const categoryData = transaction.reduce((acc, { type, category, amount }) => {
        if (!acc[category]) {
            acc[category] = { Income: 0, Expense: 0 };
        }

        if (type === 'Income') {
            acc[category].Income += amount;
        } else if (type === 'Expense') {
            acc[category].Expense += amount;
        }

        return acc;
    }, {});

    // Extract categories and respective income & expense values for chart display
    const categories = Object.keys(categoryData);
    const incomeValues = categories.map(category => categoryData[category].Income);
    const expenseValues = categories.map(category => categoryData[category].Expense);
    console.log('categories', categories);
    console.log('incomeValues', incomeValues);
    console.log('expenseValues', expenseValues);

    return (
        <div className='analytics'>
            <div className='row'>
                {loading && <Spinner />}
                <div className='col-md-4 mt-3'>
                    <div className='transaction-count'>
                        <h4>Total Transactions: {totalTransaction}</h4>
                        <hr />
                        <h5>Income: {totalIncomeTransaction}</h5>
                        <h5>Expense: {totalExpenseTransaction}</h5>
                        <br />
                        <div className='progress-bars mx-4 mb-4'>
                            <Progress className='mx-5' strokeColor='#36A2EB' type="circle" percent={totalIncomeTransactionPercentage.toFixed(1)} />
                            <Progress strokeColor='#E5572F' type="circle" percent={totalExpenseTransactionPercentage.toFixed(1)} />
                        </div>
                    </div>
                </div>
                <div className='col-md-4 mt-3'>
                    <div className='transaction-count'>
                        <h4>Total Transactions: {totalTurnover}</h4>
                        <hr />
                        <h5>Income: {totalIncomeTurnover}</h5>
                        <h5>Expense: {totalExpenseTurnover}</h5>
                        <br />
                        <div className='progress-bars mx-4 mb-4'>
                            <Progress className='mx-5' strokeColor='#36A2EB' type="circle" percent={totalIncomeTurnoverPercentage.toFixed(1)} />
                            <Progress strokeColor='#E74C3C' type="circle" percent={totalExpenseTurnoverPercentage.toFixed(1)} />
                        </div>
                    </div>
                </div>
                <div className='col-md-4 mt-3'>
                    <div className='transaction-count' style={{ height: '302px', width: '476px'}}>
                        <h4>Income and Expense Trends</h4>
                        <hr />
                        <Line className="mt-2" ref={chartRef} data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-md-4 mt-3'>
                    <div className='transaction-count'>
                        <h4>Monthly Income and Expense Analysis</h4>
                        <hr />
                        <Bar className="mt-3" data={barChartData} options={barChartOptions} />
                    </div>
                </div>
                <div className='col-md-4 mt-3'>
                    <div className='transaction-count' style={{ height: '308px', width: '472px' }}>
                        <h4>Incomes Structure</h4>
                        <hr />
                        <Doughnut className='mx-3 mt-3 mb-5' data={incomePieChartData} options={incomePieChartOptions} style={{padding: '1px'}}/>
                    </div>
                </div>
                <div className='col-md-4 mt-3'>
                    <div className='transaction-count' style={{ height: '308px', width: '476px' }}>
                        <h4>Expenses Structure</h4>
                        <hr />
                        <Doughnut className='mx-3 mt-3 mb-5' data={expensePieChartData} options={expensePieChartOptions} style={{padding: '1px'}}/>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-md-6'>
                    <div className='income-category-analysis'>
                        <br />
                        <h4>Income - Category Wise</h4>
                        {categories.map((category) => {
                            const filteredTransactions = transaction.filter(t => t.type === 'Income' && t.category === category);
                            const amount = filteredTransactions.reduce((acc, item) => acc + item.amount, 0);

                            let iconClassName = 'category-icon'; // Default class
                            if (incomeCategoryIcons[category]) {
                                if (category === 'Food & Drink' || category === 'Groceries' || category === 'Restaurants') {
                                    iconClassName = 'category-icon food-drink'; // Change class based on specific categories
                                } else if (category === 'Shopping' || category === 'Clothes & Shoes' || category === 'Electronics' || category === 'Kids' || category === 'Gifts') {
                                    iconClassName = 'category-icon shopping'; // Change class based on 'Income' category
                                } else if (category === 'Housing' || category === 'Mortgage & Rent' || category === 'Home Supplies' || category === 'Home Services' || category === 'Rent the House') {
                                    iconClassName = 'category-icon housing'; // Change class based on 'Income' category
                                } else if (category === 'Transportation' || category === 'Business Trips' || category === 'Public Transportation' || category === 'Family Trips') {
                                    iconClassName = 'category-icon transportation'; // Change class based on 'Income' category
                                } else if (category === 'Vehicle' || category === 'Fuel' || category === 'Service & Parts') {
                                    iconClassName = 'category-icon vehicle'; // Change class based on 'Income' category
                                } else if (category === 'Life & Entertainment' || category === 'Sports' || category === 'TV & Netflix' || category === 'Games' || category === 'Doctor & Healthcare') {
                                    iconClassName = 'category-icon Life-entertainment'; // Change class based on 'Income' category
                                } else if (category === 'Financial Expense' || category === 'Bank Fee' || category === 'Interest Payment' || category === 'Child Support' || category === 'Tax' || category === 'Insurance' || category === 'Loan') {
                                    iconClassName = 'category-icon Finan'; // Change class based on 'Income'                              
                                } else if (category === 'Incomes' || category === 'Salary' || category === 'Rental Income' || category === 'Interest' || category === 'Lottery' || category === 'Transfer') {
                                    iconClassName = 'category-icon income'; // Change class based on 'Income' category
                                }
                            }

                            return (
                                amount > 0 &&
                                <div className='category-card' key={category}>
                                    <h5>
                                        {incomeCategoryIcons[category] && (
                                            <span className={iconClassName}>{incomeCategoryIcons[category]}</span>
                                        )}
                                        {category}
                                    </h5>
                                    <Progress strokeColor='#36A2EB' percent={((amount / totalIncomeTurnover) * 100).toFixed(0)} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='category-analysis'>
                        <br />
                        <h4>Expense - Category Wise</h4>
                        {categories.map((category) => {
                            const filteredTransactions = transaction.filter(t => t.type === 'Expense' && t.category === category);
                            const amount = filteredTransactions.reduce((acc, item) => acc + item.amount, 0);

                            let iconClassName = 'category-icon'; // Default class
                            if (incomeCategoryIcons[category]) {
                                if (category === 'Food & Drink' || category === 'Groceries' || category === 'Restaurants') {
                                    iconClassName = 'category-icon food-drink'; // Change class based on specific categories
                                } else if (category === 'Shopping' || category === 'Clothes & Shoes' || category === 'Electronics' || category === 'Kids' || category === 'Gifts') {
                                    iconClassName = 'category-icon shopping'; // Change class based on 'Income' category
                                } else if (category === 'Housing' || category === 'Mortgage & Rent' || category === 'Home Supplies' || category === 'Home Services' || category === 'Rent the House') {
                                    iconClassName = 'category-icon housing'; // Change class based on 'Income' category
                                } else if (category === 'Transportation' || category === 'Business Trips' || category === 'Public Transportation' || category === 'Family Trips') {
                                    iconClassName = 'category-icon transportation'; // Change class based on 'Income' category
                                } else if (category === 'Vehicle' || category === 'Fuel' || category === 'Service & Parts') {
                                    iconClassName = 'category-icon vehicle'; // Change class based on 'Income' category
                                } else if (category === 'Life & Entertainment' || category === 'Sports' || category === 'TV & Netflix' || category === 'Games' || category === 'Doctor & Healthcare') {
                                    iconClassName = 'category-icon Life-entertainment'; // Change class based on 'Income' category
                                } else if (category === 'Financial Expense' || category === 'Bank Fee' || category === 'Interest Payment' || category === 'Child Support' || category === 'Tax' || category === 'Insurance' || category === 'Loan') {
                                    iconClassName = 'category-icon Finan'; // Change class based on 'Income'                              
                                } else if (category === 'Incomes' || category === 'Salary' || category === 'Rental Income' || category === 'Interest' || category === 'Lottery' || category === 'Transfer') {
                                    iconClassName = 'category-icon income'; // Change class based on 'Income' category
                                }
                            }


                            return (
                                amount > 0 &&
                                <div className='category-card' key={category}>
                                    <h5>
                                        {incomeCategoryIcons[category] && (
                                            <span className={iconClassName}>{incomeCategoryIcons[category]}</span>
                                        )}
                                        {category}
                                    </h5>
                                    <Progress strokeColor='#36A2EB' percent={((amount / totalExpenseTurnover) * 100).toFixed(0)} />
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Analytics;
