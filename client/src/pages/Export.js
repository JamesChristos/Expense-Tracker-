import React, { useEffect, useState } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import '../resources/transactions.css';
import { Form, Modal, Input, Select, TreeSelect, DatePicker, message, Table, Button } from 'antd';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import Analytics from '../components/Analytics';
import Spinner from '../components/Spinner';
import { EditOutlined, DeleteOutlined, UnorderedListOutlined, AreaChartOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillTransfer, faShoppingBag, faHome, faUtensils, faCartShopping, faCar, faSmile, faDollarSign, faLightbulb, faBowlFood, faGlassWater, faShirt, faBaseball, faBaby, faGift, faHomeUser, faBoxesPacking, faToiletPaper, faTruckPlane, faTrainSubway, faCarSide, faGasPump, faBaseballBatBall, faTv, faGamepad, faHospital, faBank, faCreditCard, faMoneyBill, faIdCard, faLandmark, faCoins, faHouseChimneyMedical, faHouseChimneyUser, faBus, faDice, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

function Export() {
    const [loading, setLoading] = useState(false);
    const [TransactionData, setTransactionData] = useState([]);
    const [frequency, setFrequency] = useState('7');
    const [selectRange, setSelectRange] = useState([]);
    const [type, setType] = useState('all');
    const [viewType, setViewType] = useState('table');
    const [selectItemForEdit, setSelectItemForEdit] = useState(null);
    const [OCRResult, setOCRResult] = useState({});
    const [showAddEditTransactionModel, setshowAddEditTransactionModel] = useState(false);
    const [showOCRModal, setshowOCRModal] = useState(false);

    useEffect(() => {
        getTransactions();
    }, [frequency, selectRange, type]);

    const handleButtonClick = async (action) => {
        if (action === 'add') {
            setSelectItemForEdit(null);
            setshowAddEditTransactionModel(true);
        } else if (action === 'ocr') {
            setOCRResult({}); // Reset OCR result before opening the OCR modal
            setshowOCRModal(true);
        }
    };

    const onFinish = async (values) => {
        try {
            const user = JSON.parse(localStorage.getItem('users'));
            const finalValues = OCRResult.amount ? { ...OCRResult, ...values, userid: user._id } : { ...values, userid: user._id };

            setLoading(true);

            if (selectItemForEdit) {
                await axios.post('/api/transactions/edit-transaction', {
                    payload: finalValues,
                    transactionId: selectItemForEdit._id
                });
                message.success('Transaction Updated Successfully');
            } else {
                await axios.post('/api/transactions/add-transaction', finalValues);
                message.success('Transaction Added Successfully');
            }

            setSelectItemForEdit(null);
            setshowAddEditTransactionModel(false);
            setLoading(false);
            getTransactions(); // Fetch updated transactions after adding/editing
        } catch (err) {
            message.error('Something went wrong');
            setLoading(false);
        }
    };

    const getTransactions = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('users'));
            setLoading(true);
            const response = await axios.post('/api/transactions/get-all-transactions', {
                userid: user._id,
                frequency,
                ...(frequency === 'custom' && { selectRange }),
                type,
            });
            console.log('Transaction Data:', response.data); // Log the data
            setTransactionData(response.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error('Something went wrong');
        }
    };

    const deleteTransactions = async (record) => {
        try {
            setLoading(true);
            await axios.post('/api/transactions/delete-transaction', { transactionId: record._id });
            message.success('Successfully deleted transaction');
            getTransactions();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error('Something went wrong');
        }
    };

    const exportToCSV = () => {
        try {
            const dataToExport = TransactionData.map(({ amount, date, category, description, type }) => ({
                amount,
                date: moment(date).format('YYYY-MM-DD'),
                category,
                description,
                type,
            }));

            const csv = Papa.unparse(dataToExport, { header: true });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(blob, 'transactions.csv');
            } else {
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', 'transactions.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error exporting to CSV', error);
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text('Incomes & Expenses Report', 20, 10);
            const dataToExport = TransactionData.map(({ amount, date, category, description, type }) => [
                moment(date).format('YYYY-MM-DD'),
                `$${amount}`,
                type,
                category,
                description,
            ]);

            doc.autoTable({
                head: [['Date', 'Amount', 'Type', 'Category', 'Description']],
                body: dataToExport,
            });

            doc.save('transactions.pdf');
        } catch (error) {
            console.error('Error exporting to PDF', error);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (text, record) => {
                // Display the amount with its sign
                const formattedAmount = record.type === 'Expense' ? `-$${Math.abs(text)}` : `$${text}`;
                return <span style={{ color: record.type === 'Expense' ? 'red' : 'green' }}>{formattedAmount}</span>;
            },
        },
        {
            title: 'Type',
            dataIndex: 'type',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            render: (text) => {
                let icon = null;
                let iconClassName = null;

                // Assign icons based on category names and set respective CSS classes
                if (text === 'Food & Drink') {
                    icon = <FontAwesomeIcon icon={faUtensils} className='white-icon' />;
                    iconClassName = 'category-icon food-drink';
                } else if (text === 'Restaurants') {
                    icon = <FontAwesomeIcon icon={faBowlFood} className='white-icon' />;
                    iconClassName = 'category-icon food-drink';
                } else if (text === 'Groceries') {
                    icon = <FontAwesomeIcon icon={faShoppingBag} className='white-icon' />;
                    iconClassName = 'category-icon food-drink';
                } else if (text === 'Coffee & Bars') {
                    icon = <FontAwesomeIcon icon={faGlassWater} className='white-icon' />;
                    iconClassName = 'category-icon food-drink';
                } else if (text === 'Shopping') {
                    icon = <FontAwesomeIcon icon={faCartShopping} className='white-icon' />
                    iconClassName = 'category-icon shopping';
                } else if (text === 'Clothes & Shoes') {
                    icon = <FontAwesomeIcon icon={faShirt} className='white-icon' />
                    iconClassName = 'category-icon shopping'
                } else if (text === 'Electronics') {
                    icon = <FontAwesomeIcon icon={faLightbulb} className='white-icon' />
                    iconClassName = 'category-icon shopping'
                } else if (text === 'Kids') {
                    icon = <FontAwesomeIcon icon={faBaby} className='white-icon' />
                    iconClassName = 'category-icon shopping'
                } else if (text === 'Gifts') {
                    icon = <FontAwesomeIcon icon={faGift} className='white-icon' />
                    iconClassName = 'category-icon shopping'
                } else if (text === 'Housing') {
                    icon = <FontAwesomeIcon icon={faHome} className='white-icon' />
                    iconClassName = 'category-icon housing'
                } else if (text === 'Mortgage & Rent') {
                    icon = <FontAwesomeIcon icon={faHomeUser} className='white-icon' />
                    iconClassName = 'category-icon housing'
                } else if (text === 'Home Supplies') {
                    icon = <FontAwesomeIcon icon={faBoxesPacking} className='white-icon' />
                    iconClassName = 'category-icon housing'
                } else if (text === 'Home Services') {
                    icon = <FontAwesomeIcon icon={faToiletPaper} className='white-icon' />
                    iconClassName = 'category-icon housing'
                } else if (text === 'Rent the House') {
                    icon = <FontAwesomeIcon icon={faHome} className='white-icon' />
                    iconClassName = 'category-icon housing'
                } else if (text === 'Transportation') {
                    icon = <FontAwesomeIcon icon={faBus} className='white-icon' />
                    iconClassName = 'category-icon transportation'
                } else if (text === 'Business Trips') {
                    icon = <FontAwesomeIcon icon={faTruckPlane} className='white-icon' />
                    iconClassName = 'category-icon transportation'
                } else if (text === 'Public Transportation') {
                    icon = <FontAwesomeIcon icon={faTrainSubway} className='white-icon' />
                    iconClassName = 'category-icon transportation'
                } else if (text === 'Family Trips') {
                    icon = <FontAwesomeIcon icon={faCar} className='white-icon' />
                    iconClassName = 'category-icon transportation'
                } else if (text === 'Vehicle') {
                    icon = <FontAwesomeIcon icon={faCarSide} className='white-icon' />
                    iconClassName = 'category-icon vehicle'
                } else if (text === 'Fuel') {
                    icon = <FontAwesomeIcon icon={faGasPump} className='white-icon' />
                    iconClassName = 'category-icon vehicle'
                } else if (text === 'Service & Parts') {
                    icon = <FontAwesomeIcon icon={faCartShopping} className='white-icon' />
                    iconClassName = 'category-icon vehicle'
                } else if (text === 'Life & Entertainment') {
                    icon = <FontAwesomeIcon icon={faSmile} className='white-icon' />
                    iconClassName = 'category-icon Life-entertainment'
                } else if (text === 'Sports') {
                    icon = <FontAwesomeIcon icon={faBaseballBatBall} className='white-icon' />
                    iconClassName = 'category-icon Life-entertainment'
                } else if (text === 'TV & Netflix') {
                    icon = <FontAwesomeIcon icon={faTv} className='white-icon' />
                    iconClassName = 'category-icon Life-entertainment'
                } else if (text === 'Games') {
                    icon = <FontAwesomeIcon icon={faGamepad} className='white-icon' />
                    iconClassName = 'category-icon Life-entertainment'
                } else if (text === 'Doctor & Healthcare') {
                    icon = <FontAwesomeIcon icon={faHospital} className='white-icon' />
                    iconClassName = 'category-icon Life-entertainment'
                } else if (text === 'Financial Expense') {
                    icon = <FontAwesomeIcon icon={faDollarSign} className='white-icon' />
                    iconClassName = 'category-icon Finan'
                } else if (text === 'Bank Fee') {
                    icon = <FontAwesomeIcon icon={faBank} className='white-icon' />
                    iconClassName = 'category-icon Finan'
                } else if (text === 'Interest Payment') {
                    icon = <FontAwesomeIcon icon={faCreditCard} className='white-icon' />
                    iconClassName = 'category-icon Finan'
                } else if (text === 'Child Support') {
                    icon = <FontAwesomeIcon icon={faBaby} className='white-icon' />
                    iconClassName = 'category-icon Finan'
                } else if (text === 'Tax') {
                    icon = <FontAwesomeIcon icon={faMoneyBill} className='white-icon' />
                    iconClassName = 'category-icon Finan'
                } else if (text === 'Insurance') {
                    icon = <FontAwesomeIcon icon={faIdCard} className='white-icon' />
                    iconClassName = 'category-icon Finan'
                } else if (text === 'Loan') {
                    icon = <FontAwesomeIcon icon={faLandmark} className='white-icon' />
                    iconClassName = 'category-icon Finan'
                } else if (text === 'Incomes') {
                    icon = <FontAwesomeIcon icon={faCoins} className='white-icon' />

                    iconClassName = 'category-icon income'
                } else if (text === 'Salary') {
                    icon = <FontAwesomeIcon icon={faMoneyBill} className='white-icon' />
                    iconClassName = 'category-icon income'
                } else if (text === 'Rental Income') {
                    icon = <FontAwesomeIcon icon={faHouseChimneyUser} className='white-icon' />
                    iconClassName = 'category-icon income'
                } else if (text === 'Interest') {
                    icon = <FontAwesomeIcon icon={faCreditCard} className='white-icon' />
                    iconClassName = 'category-icon income'
                } else if (text === 'Lottery') {
                    icon = <FontAwesomeIcon icon={faDice} className='white-icon' />
                    iconClassName = 'category-icon income'
                } else if (text === 'Transfer') {
                    icon = <FontAwesomeIcon icon={faMoneyBillTransfer} className='white-icon' />
                    iconClassName = 'category-icon income'
                }

                return (
                    <div>
                        {icon && <span className={iconClassName}>{icon}</span>}
                        {text}
                    </div>
                );
            },
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => {
                return <div>
                    <EditOutlined onClick={() => {
                        setSelectItemForEdit(record)
                        setshowAddEditTransactionModel(true)
                    }}
                    />
                    <DeleteOutlined className='mx-3' onClick={() => deleteTransactions(record)} />
                </div>
            }
        }
    ]

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

    return (
        <DefaultLayout>
            <div className='filter d-flex justify-content-between align-items-center'>
                <div className='d-flex'>
                    <div className='d-felx flex-column'>
                        <h6>Select Frequency</h6>
                        <Select value={frequency} onChange={(value) => setFrequency(value)}
                            style={{ width: '180px', height: '35px' }}>
                            <Option value="7">Last 7 days</Option>
                            <Option value="30">Last 30 days</Option>
                            <Option value="365">Last 365 days</Option>
                            <Option value="custom">Custom</Option>
                        </Select>
                        {frequency === 'custom' && (
                            <div className='mt-2'>
                                <RangePicker value={selectRange} onChange={(values) => setSelectRange(values)} />
                            </div>
                        )}
                    </div>

                    <div className='d-felx flex-column mx-5'>
                        <h6>Select Type</h6>
                        <Select value={type} onChange={(values) => setType(values)}
                            style={{ width: '140px', height: '35px' }}>
                            <Option value="all">All Types</Option>
                            <Option value="Income">Income</Option>
                            <Option value="Expense">Expense</Option>
                        </Select>
                    </div>
                    <div className='d-flex flex-column mx-1'>
                        <h6>Export</h6>
                        <div className='d-flex'>
                            <button className='primary' onClick={exportToCSV}>CSV</button>
                            <button className='primary mx-2' onClick={exportToPDF}>PDF</button>
                        </div>
                    </div>
                </div>
            </div>
            {loading && <Spinner />}
            <div className='table-analytics'>
                <h1 className='report-header'>INCOMES & EXPENSES REPORT</h1>
                {viewType === 'table' ? <div className='table'>
                    <Table columns={columns} dataSource={TransactionData} />
                </div> : <Analytics transaction={TransactionData} />}
            </div>
        </DefaultLayout >
    );
}

export default Export;