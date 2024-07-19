import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import "../resources/transactions.css";
import axios from "axios";
import Spinner from "../components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShoppingBag,
    faHome,
    faUtensils,
    faCartShopping,
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
    faHouseChimneyUser,
    faBus,
    faDice,
    faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import "../resources/PlannedPayments.css";
import {
    Button,
    Form,
    Input,
    Select,
    DatePicker,
    message,
    Spin,
    TreeSelect,
    Modal,
    notification,
} from "antd";
import PlanItem from "../components/PlanItem";

const { Option } = Select;
const { TextArea } = Input;

const PlannedPayments = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [form] = Form.useForm();
    const userId = JSON.parse(localStorage.getItem("users"))._id;

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        const interval = setInterval(checkForDuePayments, 60000); // Check every minute
        return () => clearInterval(interval); // Cleanup on unmount
    }, [plans]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/plans/${userId}`);
            setPlans(response.data);
        } catch (error) {
            message.error("Failed to fetch plans");
        }
        setLoading(false);
    };

    const checkForDuePayments = () => {
        const today = new Date();
        plans.forEach((plan) => {
            const nextPaymentDate = new Date(plan.nextPaymentDate);
            if (nextPaymentDate <= today) {
                notification.warning({
                    message: `Payment Due`,
                    description: `Payment due for plan: ${plan.description}`,
                });
    
                // Update next payment date and last payment date
                const newLastPaymentDate = new Date();
                const newNextPaymentDate = calculateNextPaymentDate(newLastPaymentDate, plan.frequency);
    
                axios.put(`/api/plans/${plan._id}`, {
                    ...plan,
                    lastPaymentDate: newLastPaymentDate,
                    nextPaymentDate: newNextPaymentDate,
                }).then(fetchPlans).catch(error => message.error("Failed to update plan"));
            }
        });
    };    

    const onAddPlan = () => {
        setSelectedPlan(null);
        setShowAddPlanModal(true);
    };

    // const handleEdit = (planDetails) => {
    //     setSelectedPlan(planDetails);
    //     setShowAddPlanModal(true);
    // };

    const onDelete = async (planId) => {
        setLoading(true);
        try {
            await axios.delete(`/api/plans/${planId}`);
            message.success("Plan deleted successfully");
            fetchPlans();
        } catch (error) {
            message.error("Failed to delete plan");
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (lastPaymentDate, nextPaymentDate, frequency) => {
        const oneDay = 24 * 60 * 60 * 1000;
        const today = new Date();
        const lastPayment = new Date(lastPaymentDate);
        const nextPayment = new Date(nextPaymentDate);

        let period = 0;
        if (frequency === "Weekly") {
            period = 7 * oneDay;
        } else if (frequency === "Monthly") {
            period = 30 * oneDay;
        } else if (frequency === "Every Minute") {
            period = 60 * 1000; // 1 minute in milliseconds
        }

        const timeSinceLastPayment = today - lastPayment;
        const progress = Math.min(100, (timeSinceLastPayment / period) * 100);

        return progress > 0 ? progress : 0;
    };

    const calculateNextPaymentDate = (startDate, frequency) => {
        const date = new Date(startDate);
        if (frequency === "Weekly") {
            date.setDate(date.getDate() + 7);
        } else if (frequency === "Monthly") {
            date.setMonth(date.getMonth() + 1);
        } else if (frequency === "Every Minute") {
            date.setMinutes(date.getMinutes() + 1);
        }
        return date;
    };

    const calculateRemainingDays = (nextPaymentDate, frequency) => {
        const today = new Date();
        const paymentDate = new Date(nextPaymentDate);

        if (today < paymentDate) {
            return 0;
        }

        let remainingDays = 0;
        if (frequency === "Weekly") {
            const timeDiff = paymentDate.getTime() - today.getTime();
            remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
        } else if (frequency === "Monthly") {
            const monthsDiff = (paymentDate.getFullYear() - today.getFullYear()) * 12 + (paymentDate.getMonth() - today.getMonth());
            remainingDays = monthsDiff * 30;
        } else if (frequency === "Every Minute") {
            const minutesDiff = (paymentDate - today) / (1000 * 60);
            remainingDays = Math.ceil(minutesDiff);
        }

        return remainingDays >= 0 ? remainingDays : 0;
    };

    const onFinish = async (values) => {
        setLoading(true);
        const nextPaymentDate = calculateNextPaymentDate(values.nextPaymentDate, values.frequency);
        const lastPaymentDate = new Date(values.nextPaymentDate);
        
        try {
            await axios.post("/api/plans/add_plan", {
                ...values,
                userId,
                lastPaymentDate,
                nextPaymentDate,
            });
            message.success("Plan added successfully");
    
            setShowAddPlanModal(false);
            form.resetFields();
            fetchPlans(); // Assuming this function fetches and updates the list of plans
        } catch (error) {
            message.error("Failed to save plan");
        } finally {
            setLoading(false);
        }
    };
    

    const totalPlanned = plans.reduce((acc, plan) => acc + plan.amount, 0);


    const treeData = [
        {
            title: (
                <span>
                    <span className="category-icon-data-tree food-drink">
                        <FontAwesomeIcon icon={faUtensils} className="white-icon" />
                    </span>{" "}
                    Food & Drink
                </span>
            ),
            value: "Food & Drink",
            icon: <FontAwesomeIcon icon={faUtensils} className="white-icon" />,
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree food-drink">
                                <FontAwesomeIcon icon={faShoppingBag} className="white-icon" />
                            </span>{" "}
                            Groceries
                        </span>
                    ),
                    value: "Groceries",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree food-drink">
                                <FontAwesomeIcon icon={faBowlFood} className="white-icon" />
                            </span>{" "}
                            Restaurants
                        </span>
                    ),
                    value: "Restaurants",
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree shopping">
                        <FontAwesomeIcon icon={faShoppingCart} className="white-icon" />
                    </span>{" "}
                    Shopping
                </span>
            ),
            value: "Shopping",
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faShirt} className="white-icon" />
                            </span>{" "}
                            Clothes & Shoes
                        </span>
                    ),
                    value: "Clothes & Shoes",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faLightbulb} className="white-icon" />
                            </span>{" "}
                            Electronics
                        </span>
                    ),
                    value: "Electronics",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faBaby} className="white-icon" />
                            </span>{" "}
                            Kids
                        </span>
                    ),
                    value: "Kids",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree shopping">
                                <FontAwesomeIcon icon={faGift} className="white-icon" />
                            </span>{" "}
                            Gifts
                        </span>
                    ),
                    value: "Gifts",
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree housing">
                        <FontAwesomeIcon icon={faHome} className="white-icon" />
                    </span>{" "}
                    Housing
                </span>
            ),
            value: "Housing",
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faHomeUser} className="white-icon" />
                            </span>{" "}
                            Mortgage & Rent
                        </span>
                    ),
                    value: "Mortgage & Rent",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faBoxesPacking} className="white-icon" />
                            </span>{" "}
                            Home Supplies
                        </span>
                    ),
                    value: "Home Supplies",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faToiletPaper} className="white-icon" />
                            </span>{" "}
                            Home Services
                        </span>
                    ),
                    value: "Home Services",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree housing">
                                <FontAwesomeIcon icon={faHome} className="white-icon" />
                            </span>{" "}
                            Rent the House
                        </span>
                    ),
                    value: "Rent the House",
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree transportation">
                        <FontAwesomeIcon icon={faBus} className="white-icon" />
                    </span>{" "}
                    Transportation
                </span>
            ),
            value: "Transportation",
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree transportation">
                                <FontAwesomeIcon icon={faTruckPlane} className="white-icon" />
                            </span>{" "}
                            Business Trips
                        </span>
                    ),
                    value: "Business Trips",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree transportation">
                                <FontAwesomeIcon icon={faTrainSubway} className="white-icon" />
                            </span>{" "}
                            Public Transportation
                        </span>
                    ),
                    value: "Public Transportation",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree transportation">
                                <FontAwesomeIcon icon={faCar} className="white-icon" />
                            </span>{" "}
                            Family Trips
                        </span>
                    ),
                    value: "Family Trips",
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree vehicle">
                        <FontAwesomeIcon icon={faCarSide} className="white-icon" />
                    </span>{" "}
                    Vehicle
                </span>
            ),
            value: "Vehicle",
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree vehicle">
                                <FontAwesomeIcon icon={faGasPump} className="white-icon" />
                            </span>{" "}
                            Fuel
                        </span>
                    ),
                    value: "Fuel",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree vehicle">
                                <FontAwesomeIcon icon={faCartShopping} className="white-icon" />
                            </span>{" "}
                            Service & Parts
                        </span>
                    ),
                    value: "Service & Parts",
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree Life-entertainment">
                        <FontAwesomeIcon icon={faSmile} className="white-icon" />
                    </span>{" "}
                    Life & Entertainment
                </span>
            ),
            value: "Life & Entertainment",
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon
                                    icon={faBaseballBatBall}
                                    className="white-icon"
                                />
                            </span>{" "}
                            Sports
                        </span>
                    ),
                    value: "Sports",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon icon={faTv} className="white-icon" />
                            </span>{" "}
                            TV & Netflix
                        </span>
                    ),
                    value: "TV & Netflix",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon icon={faGamepad} className="white-icon" />
                            </span>{" "}
                            Games
                        </span>
                    ),
                    value: "Games",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Life-entertainment">
                                <FontAwesomeIcon icon={faHospital} className="white-icon" />
                            </span>{" "}
                            Doctor & Healthcare
                        </span>
                    ),
                    value: "Doctor & Healthcare",
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree Finan">
                        <FontAwesomeIcon icon={faDollarSign} className="white-icon" />
                    </span>{" "}
                    Financial Expense
                </span>
            ),
            value: "Financial Expense",
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faBank} className="white-icon" />
                            </span>{" "}
                            Bank Fee
                        </span>
                    ),
                    value: "Bank Fee",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faCreditCard} className="white-icon" />
                            </span>{" "}
                            Interest Payment
                        </span>
                    ),
                    value: "Interest Payment",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faBaby} className="white-icon" />
                            </span>{" "}
                            Child Support
                        </span>
                    ),
                    value: "Child Support",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faMoneyBill} className="white-icon" />
                            </span>{" "}
                            Tax
                        </span>
                    ),
                    value: "Tax",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faIdCard} className="white-icon" />
                            </span>{" "}
                            Insurance
                        </span>
                    ),
                    value: "Insurance",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree Finan">
                                <FontAwesomeIcon icon={faLandmark} className="white-icon" />
                            </span>{" "}
                            Loan
                        </span>
                    ),
                    value: "Loan",
                },
            ],
        },
        {
            title: (
                <span>
                    <span className="category-icon-data-tree income">
                        <FontAwesomeIcon icon={faCoins} className="white-icon" />
                    </span>{" "}
                    Incomes
                </span>
            ),
            value: "Incomes",
            children: [
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon icon={faMoneyBill} className="white-icon" />
                            </span>{" "}
                            Salary
                        </span>
                    ),
                    value: "Salary",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon
                                    icon={faHouseChimneyUser}
                                    className="white-icon"
                                />
                            </span>{" "}
                            Rental Income
                        </span>
                    ),
                    value: "Rental Income",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon icon={faCreditCard} className="white-icon" />
                            </span>{" "}
                            Interest
                        </span>
                    ),
                    value: "Interest",
                },
                {
                    title: (
                        <span>
                            <span className="category-icon-data-tree income">
                                <FontAwesomeIcon icon={faDice} className="white-icon" />
                            </span>{" "}
                            Lottery
                        </span>
                    ),
                    value: "Lottery",
                },
            ],
        },
    ];

    return (
        <DefaultLayout>
            <div className="filter d-flex justify-content-between align-items-center">
                <button
                    className="primary"
                    style={{ color: "aliceblue" }}
                    onClick={onAddPlan}
                >
                    ADD PAYMENT PLAN
                </button>
            </div>
            {loading && <Spinner />}

            <Modal
                title={"Add Plan"}
                open={showAddPlanModal}
                onCancel={() => setShowAddPlanModal(false)}
                footer={null}
            >
                <Form
                    form={form}
                    className="transaction-form"
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                        <Input type="number" placeholder="Enter amount" />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true }]}
                    >
                        <TreeSelect
                            style={{ width: "100%" }}
                            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                            placeholder="Please select"
                            // Provide treeData prop correctly
                            treeData={treeData}
                        />
                    </Form.Item>

                    <Form.Item
                        name="frequency"
                        label="Frequency"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="Select frequency">
                            <Option value="Monthly">Monthly</Option>
                            <Option value="Weekly">Weekly</Option>
                            <Option value="Every Minute">Every Minute</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="nextPaymentDate"
                        label="Next Payment Date"
                        rules={[{ required: true }]}
                    >
                    <DatePicker/>
                    </Form.Item>
                    <Form.Item
                        className="transaction-form"
                        label="Description"
                        name="description"
                        rules={[{ required: true }]}
                    >
                    <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save Plan
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <div>
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <div className="planned-payments-summary">
                        <div style={{ display: 'flex', alignItems: 'center', }}>
                            <h1>TOTAL PAYMENT PLAN: </h1>
                            <h2>
                                {totalPlanned.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                })}
                            </h2>
                        </div>
                        <div className="plan-items-container">
                            {plans.map((plan) => (
                                <div className="plan-item" key={plan._id}>
                                    <PlanItem
                                        userId={plan.userId}
                                        amount={plan.amount}
                                        category={plan.category}
                                        frequency={plan.frequency}
                                        nextPaymentDate={plan.nextPaymentDate}
                                        description={plan.description}
                                        lastPaymentDate={plan.lastPaymentDate}
                                        progress={calculateProgress(
                                            plan.lastPaymentDate,
                                            plan.nextPaymentDate,
                                            plan.frequency
                                        )}
                                        remainingDays={calculateRemainingDays(plan.nextPaymentDate, plan.frequency)}
                                        onDelete={() => onDelete(plan._id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
};

export default PlannedPayments;