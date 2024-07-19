import React, { useEffect, useState } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import '../resources/transactions.css';
import { Form, Modal, Input, TreeSelect, DatePicker, message, Button, Popconfirm, Progress, notification, Checkbox, Segmented  } from 'antd';
import axios from 'axios';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGlassWater,
    faShoppingBasket,
    faBaseball,
    faCartShopping,
    faMoneyBillTransfer,
    faUtensils,
    faShoppingBag,
    faHome,
    faShoppingCart,
    faCar,
    faSmile,
    faDollarSign,
    faLightbulb,
    faBowlFood,
    faShirt,
    faBaby,
    faGift,
    faHomeUser,
    faBoxesPacking,
    faToiletPaper,
    faTruckPlane,
    faTrainSubway,
    faCarSide,
    faGasPump,
    faBaseballBatBall,
    faTv,
    faGamepad,
    faHospital,
    faBank,
    faCreditCard,
    faMoneyBill,
    faIdCard,
    faLandmark,
    faCoins,
    faHouseChimneyMedical,
    faHouseChimneyUser,
    faBus,
    faDice,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';


const Goal = () => {
    const [selectItemForEdit, setSelectItemForEdit] = useState(null);
    const [showAddEditGoalModal, setShowAddEditGoalModal] = useState(false);
    const [goals, setGoals] = useState([]);
    const [form] = Form.useForm();
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [availableIncome, setAvailableIncome] = useState(0);
    const [activeTab, setActiveTab] = useState("1");
    const [noDueDate, setNoDueDate] = useState(false);


    const fetchGoals = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('users'));
            const response = await axios.get(`/api/goals/get-all-goals?userId=${user._id}`);
            setGoals(response.data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const fetchGoalCurrentAmount = async (goalId) => {
        try {
            const response = await axios.get(`/api/goals/get-current-amount/${goalId}`);
            return response.data.currentAmount;
        } catch (error) {
            console.error('Error fetching goal current amount:', error);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const onFinish = async (values) => {
        notification.success({
            message: 'Success',
            description: 'Goal added successfully',
            duration: 10,
        });
        try {
            const user = JSON.parse(localStorage.getItem('users'));
            const targetDate = values.targetDate = 'No due date';
            if (noDueDate) {
                values.targetDate = 'No due date';
            } else {
                values.targetDate = values.targetDate.endOf('day').toDate();
            }
            const currentDate = new Date();

            if (targetDate < currentDate) {
                message.error('Target date should be in the future.');
                return;
            }

            const goalData = {
                userId: user?._id,
                name: values.name,
                targetAmount: values.targetAmount,
                category: values.category,
                targetDate,
                currentAmount: 0,
                description: values.description,
            };

            if (selectItemForEdit) {
                await axios.post('/api/goals/edit_goal', {
                    ...goalData,
                    goalId: selectItemForEdit._id,
                });
                message.success('Goal Updated Successfully');
            } else {
                await axios.post('/api/goals/add_goal', goalData);
                message.success('Goal Added Successfully');
            }

            setShowAddEditGoalModal(false);
            fetchGoals();
        } catch (err) {
            console.error(err);
            message.error('Something went wrong');
        }
    };

    const deleteGoal = async (goal) => {
        try {
            await axios.post('/api/goals/delete_goal', {
                goalId: goal._id,
            });
            message.success('Goal deleted successfully');
            fetchGoals();
        } catch (err) {
            console.error('Error deleting goal:', err);
            notification.error({
                message: 'Error',
                description: 'Something went wrong while deleting the goal.',
            });
        }
    };

    const fetchAvailableIncome = async (userId) => {
        try {
            // Make a GET request to the server endpoint
            const response = await axios.get(`/api/transactions/get-income-transactions?userId=${userId}`);
            
            // Extract available income from the response data
            const availableIncome = response.data.availableIncome;
            
            // Update the state with the fetched available income
            setAvailableIncome(availableIncome);
        } catch (error) {
            console.error('Error fetching available income:', error);
        }
    };
    

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      };
      

    const showAddMoneyToGoalModal = async (goal) => {
        const user = JSON.parse(localStorage.getItem('users'));
        await fetchAvailableIncome(user._id);
        setSelectedGoal(goal);
        setShowAddMoneyModal(true);
    };

    const handleAddTransaction = async (transactionData) => {
        try {
            const response = await axios.post('/api/transactions/add-transaction', transactionData);
            if (response.status === 200) {
                fetchGoals();
                message.success('Transaction added successfully');
            } else {
                throw new Error('Failed to add transaction');
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            message.error('Something went wrong');
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            const response = await axios.post('/api/transactions/delete-transaction', { transactionId });
            if (response.status === 200) {
                fetchGoals();
                message.success('Transaction deleted successfully');
            } else {
                throw new Error('Failed to delete transaction');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            message.error('Something went wrong');
        }
    };

    const handleAddMoney = async (values) => {
        try {
            const user = JSON.parse(localStorage.getItem('users'));
            const amountToAdd = parseFloat(values.amount);
            if (amountToAdd > availableIncome) {
                message.error('Amount exceeds available income');
                return;
            }

            const transactionData = {
                userid: user._id,
                amount: amountToAdd,
                type: 'Expense',
                category: 'Goal Contribution',
                date: new Date(),
                description: `Added $${amountToAdd} to goal: ${selectedGoal.name}`,
                goalId: selectedGoal._id,
            };

            await handleAddTransaction(transactionData);
            setShowAddMoneyModal(false);
        } catch (error) {
            console.error('Error adding money to goal:', error);
            message.error('Something went wrong');
        }
    };

    useEffect(() => {
        fetchGoals();
    })
    
    function calculateRemainingDays(targetDate) {
        const today = new Date();
        const target = new Date(targetDate);
        const timeDiff = target.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff === 0) {
            return 'Today';
        } else if (daysDiff === 1) {
            return 'Tomorrow';
        } else if (daysDiff < 0) {
            return 'Expired';
        } else if (daysDiff <= 7) {
            return `${daysDiff} day(s) left`;
        } else if (daysDiff <= 28) {
            const weeksLeft = Math.ceil(daysDiff / 7);
            return `${weeksLeft} week(s) left`;
        } else if (daysDiff <= 30) {
            return '1 month left';
        } else if (daysDiff <= 365) {
            const monthsLeft = Math.ceil(daysDiff / 30);
            return `${monthsLeft} month(s) left`;
        } else {
            const yearsLeft = Math.ceil(daysDiff / 365);
            return `${yearsLeft} year(s) left`;
        }
    }

    const treeData = [
        {
            title: (
                <span>
                    <span className="category-icon-data-tree food-drink">
                        <FontAwesomeIcon icon={faUtensils} className='white-icon' />
                    </span>{" "}
                    Food & Drink
                </span>
            ),
            value: 'Food & Drink',
            icon: <FontAwesomeIcon icon={faUtensils} className='white-icon' />,
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree food-drink">
                                <FontAwesomeIcon icon={faShoppingBag} className='white-icon' />
                            </span>{" "}
                            Groceries
                        </span>
                    ),
                    value: 'Groceries',
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree food-drink">
                                <FontAwesomeIcon icon={faBowlFood} className='white-icon' />
                            </span>{" "}
                            Restaurants
                        </span>
                    ),
                    value: 'Restaurants',
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree shopping">
                        <FontAwesomeIcon icon={faShoppingCart} className='white-icon' />
                    </span>{" "}
                    Shopping
                </span>
            ),
            value: 'Shopping',
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faShirt} className='white-icon' />
                            </span>{" "}
                            Clothes & Shoes
                        </span>
                    ), value: 'Clothes & Shoes'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faLightbulb} className='white-icon' />
                            </span>{" "}
                            Electronics
                        </span>
                    ), value: 'Electronics'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faBaby} className='white-icon' />
                            </span>{" "}
                            Kids
                        </span>
                    ), value: 'Kids'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faGift} className='white-icon' />
                            </span>{" "}
                            Gifts
                        </span>
                    ), value: 'Gifts'
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree housing">
                        <FontAwesomeIcon icon={faHome} className='white-icon' />
                    </span>{" "}
                    Housing
                </span>
            ),
            value: 'Housing',
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faHomeUser} className='white-icon' />
                            </span>{" "}
                            Mortgage & Rent
                        </span>
                    ), value: 'Mortgage & Rent'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faBoxesPacking} className='white-icon' />
                            </span>{" "}
                            Home Supplies
                        </span>
                    ), value: 'Home Supplies'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faToiletPaper} className='white-icon' />
                            </span>{" "}
                            Home Services
                        </span>
                    ), value: 'Home Services'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faHome} className='white-icon' />
                            </span>{" "}
                            Rent the House
                        </span>
                    ), value: 'Rent the House'
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree transportation">
                        <FontAwesomeIcon icon={faBus} className='white-icon' />
                    </span>{" "}
                    Transportation
                </span>
            ),
            value: 'Transportation',
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree transportation">
                                <FontAwesomeIcon icon={faTruckPlane} className='white-icon' />
                            </span>{" "}
                            Business Trips
                        </span>
                    ), value: 'Business Trips'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree transportation">
                                <FontAwesomeIcon icon={faTrainSubway} className='white-icon' />
                            </span>{" "}
                            Public Transportation
                        </span>
                    ), value: 'Public Transportation'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree transportation">
                                <FontAwesomeIcon icon={faCar} className='white-icon' />
                            </span>{" "}
                            Family Trips
                        </span>
                    ), value: 'Family Trips'
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree vehicle">
                        <FontAwesomeIcon icon={faCarSide} className='white-icon' />
                    </span>{" "}
                    Vehicle
                </span>
            ),
            value: 'Vehicle',
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree vehicle">
                                <FontAwesomeIcon icon={faGasPump} className='white-icon' />
                            </span>{" "}
                            Fuel
                        </span>
                    ), value: 'Fuel'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree vehicle">
                                <FontAwesomeIcon icon={faCartShopping} className='white-icon' />
                            </span>{" "}
                            Service & Parts
                        </span>
                    ), value: 'Service & Parts'
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree Life-entertainment">
                        <FontAwesomeIcon icon={faSmile} className='white-icon' />
                    </span>{" "}
                    Life & Entertainment
                </span>
            ),
            value: 'Life & Entertainment',
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon icon={faBaseballBatBall} className='white-icon' />
                            </span>{" "}
                            Sports
                        </span>
                    ), value: 'Sports'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon icon={faTv} className='white-icon' />
                            </span>{" "}
                            TV & Netflix
                        </span>
                    ), value: 'TV & Netflix'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon icon={faGamepad} className='white-icon' />
                            </span>{" "}
                            Games
                        </span>
                    ), value: 'Games'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon icon={faHospital} className='white-icon' />
                            </span>{" "}
                            Doctor & Healthcare
                        </span>
                    ), value: 'Doctor & Healthcare'
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree Finan">
                        <FontAwesomeIcon icon={faDollarSign} className='white-icon' />
                    </span>{" "}
                    Financial Expense
                </span>
            ),
            value: 'Financial Expense',
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faBank} className='white-icon' />
                            </span>{" "}
                            Bank Fee
                        </span>
                    ), value: 'Bank Fee'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faCreditCard} className='white-icon' />
                            </span>{" "}
                            Interest Payment
                        </span>
                    ), value: 'Interest Payment'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faBaby} className='white-icon' />
                            </span>{" "}
                            Child Support
                        </span>
                    ), value: 'Child Support'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faMoneyBill} className='white-icon' />
                            </span>{" "}
                            Tax
                        </span>
                    ), value: 'Tax'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faIdCard} className='white-icon' />
                            </span>{" "}
                            Insurance
                        </span>
                    ), value: 'Insurance'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faLandmark} className='white-icon' />
                            </span>{" "}
                            Loan
                        </span>
                    ), value: 'Loan'
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree income">
                        <FontAwesomeIcon icon={faCoins} className='white-icon' />
                    </span>{" "}
                    Incomes
                </span>
            ),
            value: 'Incomes',
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon icon={faMoneyBill} className='white-icon' />
                            </span>{" "}
                            Salary
                        </span>
                    ), value: 'Salary'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon icon={faHouseChimneyUser} className='white-icon' />
                            </span>{" "}
                            Rental Income
                        </span>
                    ), value: 'Rental Income'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon icon={faCreditCard} className='white-icon' />
                            </span>{" "}
                            Interest
                        </span>
                    ), value: 'Interest'
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon icon={faDice} className='white-icon' />
                            </span>{" "}
                            Lottery
                        </span>
                    ), value: 'Lottery'
                },
            ],
        },
    ];

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

    const renderCategoryIcon = (category) => {
        let iconClassName = 'category-icon'; // Default class
        let backgroundColor = '';

        if (incomeCategoryIcons[category]) {
            iconClassName = `category-icon ${category.toLowerCase().replace(/[\s&]/g, '-')}`;
            backgroundColor = getCategoryBackgroundColor(category);
        }

        return (
            <span className={iconClassName} style={{ backgroundColor }}>
                {incomeCategoryIcons[category]}
            </span>
        );
    };

    const getCategoryBackgroundColor = (category) => {
        switch (category) {
            case 'Food & Drink':
            case 'Groceries':
            case 'Restaurants':
                return '#d9534f';
            case 'Shopping':
            case 'Clothes & Shoes':
            case 'Electronics':
            case 'Kids':
            case 'Gifts':
                return '#5bc0de';
            case 'Housing':
            case 'Mortgage & Rent':
            case 'Home Supplies':
            case 'Home Services':
            case 'Rent the House':
                return '#ff8d23';
            case 'Transportation':
            case 'Business Trips':
            case 'Public Transportation':
            case 'Family Trips':
                return '#c1c1c1'
            case 'Vehicle':
            case 'Fuel':
            case 'Service & Parts':
                return '#8c00cd';
            case 'Life & Entertainment':
            case 'Sports':
            case 'TV & Netflix':
            case 'Games':
            case 'Doctor & Healthcare':
                return '#5eef68';
            case 'Financial Expense':
            case 'Bank Fee':
            case 'Interest Payment':
            case 'Child Support':
            case 'Tax':
            case 'Insurance':
            case 'Loan':
                return '#3cb38f';
            case 'Incomes':
            case 'Salary':
            case 'Rental Income':
            case 'Interest':
            case 'Lottery':
            case 'Transfer':
                return '#ffdf53';
        }
    };


    return (
        <DefaultLayout>
            <div className='filter d-flex justify-content-between align-items-center'>
                <button
                    className='primary'
                    onClick={() => setShowAddEditGoalModal(true)}
                    style={{ backgroundColor: '#176f44', borderColor: '#176f44' }}

                >
                    ADD GOAL
                </button>
                <div className="toggle-buttons">
                    <Segmented
                        className="custom-segmented"
                        options={[
                            { label: 'Current', value: '1' },
                            { label: 'Achieved', value: '2' }
                        ]}
                        value={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
            </div>

            <Modal
                title={selectItemForEdit ? 'Edit Goal' : 'Add Goal'}
                open={showAddEditGoalModal}
                onCancel={() => {
                    setSelectItemForEdit(null);
                    setShowAddEditGoalModal(false);
                }}
                footer={null}
            >
                <Form
                    layout='vertical'
                    className='transaction-form budget-form'
                    form={form}
                    onFinish={onFinish}
                    initialValues={
                        selectItemForEdit
                            ? {
                                ...selectItemForEdit,
                                targetDate: selectItemForEdit.targetDate !== 'No due date' ? moment(selectItemForEdit.targetDate) : null,
                            }
                            : {}
                    }
                >
                    <Form.Item
                        label='Goal Name'
                        name='name'
                        rules={[{ required: true, message: 'Please input the goal name!' }]}
                    >
                        <Input type='text' placeholder='Enter goal name' />
                    </Form.Item>

                    <Form.Item
                        label='Target Amount'
                        name='targetAmount'
                        rules={[{ required: true, message: 'Please input the target amount!' }]}
                    >
                        <Input type='number' placeholder='Enter target amount' />
                    </Form.Item>

                    <Form.Item
                        label='Target Date'
                        name='targetDate'
                        rules={[{ required: !noDueDate, message: 'Please select the target date!' }]}
                    >
                        <Checkbox
                            style={{ marginRight: 8 }}
                            onChange={(e) => setNoDueDate(e.target.checked)}
                        >
                            No due date
                        </Checkbox>
                        <DatePicker disabled={noDueDate} disabledDate={(current) => current && current < moment().startOf('day')} />
                    </Form.Item>

                    <Form.Item
                        label='Category'
                        name='category'
                        rules={[{ required: true, message: 'Please select a category!' }]}
                    >
                        <TreeSelect
                            style={{ width: '100%' }}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder='Please select'
                            treeData={treeData.map((node) => ({
                                ...node,
                                icon: node.icon ? <i className={node.icon} /> : null,
                                children: node.children
                                    ? node.children.map((child) => ({
                                        ...child,
                                        icon: child.icon ? <i className={child.icon} /> : null,
                                    }))
                                    : null,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label='Description' name='description'>
                        <Input.TextArea placeholder='Enter goal description' />
                    </Form.Item>

                    <Button type='primary' htmlType='submit'>
                        SAVE
                    </Button>
                </Form>
            </Modal>

            <div className='goal-table'>
                {activeTab === "1" && goals.filter(goal => goal.currentAmount < goal.targetAmount).map((goal) => {
                    const isGoalReached = goal.currentAmount >= goal.targetAmount;
                    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
                    const neededValue = goal.targetAmount - goal.currentAmount;

                    return (
                        <div key={goal._id} className='goal-item'>
                            <div className='goal-item-details'>
                                <div className='goal-item-category'>
                                    {renderCategoryIcon(goal.category)}
                                    <span className='goal-name'>{goal.name}</span>
                                </div>
                                <div className="progress-container">
                                    <div className="progress-top">
                                        <span className="target-amount">${goal.targetAmount.toFixed(2)}</span>
                                        <span className="remain-days">{goal.targetDate === 'No due date' ? 'No due date' : calculateRemainingDays(goal.targetDate)}</span>
                                    </div>
                                    <Progress
                                        percent={progressPercent.toFixed(2)}
                                        showInfo={false}
                                        format={percent => `${percent}%`}
                                        strokeColor={'green'}
                                    />
                                    <div className="progress-bottom">
                                        <span className="current-value">${goal.currentAmount} stashed</span>
                                        <span className="needed-value">${neededValue} to stash</span>
                                    </div>
                                </div>
                            </div>
                            <div className='goal-item-actions'>
                                <EditOutlined
                                    onClick={() => {
                                        setSelectItemForEdit(goal);
                                        setShowAddEditGoalModal(true);
                                    }}
                                />
                                <Popconfirm
                                    title='Are you sure to delete this goal?'
                                    onConfirm={() => deleteGoal(goal)}
                                    okText='Yes'
                                    cancelText='No'
                                >
                                    <DeleteOutlined className='mx-3' />
                                </Popconfirm>
                                <Button
                                    type='primary'
                                    disabled={isGoalReached}
                                    onClick={() => showAddMoneyToGoalModal(goal)}
                                    style={{ backgroundColor: '#176f44', borderColor: '#176f44' }}
                                >
                                    Add Money
                                </Button>

                            </div>
                        </div>
                    );
                })}
                {activeTab === "2" && goals.filter(goal => goal.currentAmount >= goal.targetAmount).map((goal) => {
                    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
                    // notification.success({
                    //     message: 'Congratulations!',
                    //     description: 'You have achieved your goal',
                    //     duration: 10,
                    // });
                    return (
                        <div key={goal._id} className='goal-item'>
                            <div className='goal-item-details'>
                                <div className='goal-item-category'>
                                    {renderCategoryIcon(goal.category)}
                                    <span className='goal-name'>{goal.name}</span>
                                </div>
                                <div className="progress-container">
                                    <div className="progress-top">
                                        <span className="target-amount">${goal.targetAmount.toFixed(2)}</span>
                                        <span className="remain-days">{goal.targetDate === 'No due date' ? 'No due date' : calculateRemainingDays(goal.targetDate)}</span>
                                    </div>
                                    <Progress
                                        percent={progressPercent.toFixed(2)}
                                        showInfo={false}
                                        format={percent => `${percent}%`}
                                        strokeColor={'green'}
                                    />
                                    <div className="progress-bottom">
                                        <span className="current-value">${goal.currentAmount.toFixed(2)} stashed</span>
                                        <span className="needed-value">Complete</span>
                                    </div>
                                </div>
                            </div>
                            <div className='goal-item-actions'>
                                <EditOutlined
                                    onClick={() => {
                                        setSelectItemForEdit(goal);
                                        setShowAddEditGoalModal(true);
                                    }}
                                />
                                <Popconfirm
                                    title='Are you sure to delete this goal?'
                                    onConfirm={() => deleteGoal(goal)}
                                    okText='Yes'
                                    cancelText='No'
                                >
                                    <DeleteOutlined className='mx-3' />
                                </Popconfirm>
                                <Button
                                    type='primary'
                                    disabled={true}
                                    onClick={() => showAddMoneyToGoalModal(goal)}
                                >
                                    Achieved
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal
                title={`Add Money to Goal: ${selectedGoal?.name}`}
                visible={showAddMoneyModal}
                onCancel={() => setShowAddMoneyModal(false)}
                footer={null}
            >
                <p>Available Income: ${availableIncome.toFixed(2)}</p>
                <Form layout='vertical' onFinish={handleAddMoney} className='transaction-form budget-form'>
                    <Form.Item
                        label='Amount'
                        name='amount'
                        rules={[{ required: true, message: 'Please input the amount!' }]}
                    >
                        <Input type='number' placeholder='Enter amount' />
                    </Form.Item>
                    <Button type='primary' htmlType='submit'>
                        Add Money
                    </Button>
                </Form>
            </Modal>
        </DefaultLayout>
    );
};

export default Goal;
