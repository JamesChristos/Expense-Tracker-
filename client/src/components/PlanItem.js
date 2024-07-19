import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Button, message, notification } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dot from '../assets/dot.png';
import "../resources/PlannedPayments.css";

const PlanItem = ({ userId, amount, category, frequency, nextPaymentDate, description, onDelete,}) => {
  const handleDelete = () => {
    onDelete(userId);
  };

  const { Countdown } = Statistic;
  const CustomCountdown = ({ deadline, onFinish }) => {
    const calculateTimeLeft = () => {
      const difference = new Date(deadline) - new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      // Clear interval on component unmount
      return () => clearInterval(timer);
    }, []);

    useEffect(() => {
      if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        onFinish();
      }
    }, [timeLeft, onFinish]);

    const formatTime = (value) => {
      return value < 10 ? `0${value}` : value;
    };

    return (
      <span className="countdown" style={{ fontSize: '12px', marginLeft: '4px', display: 'inline' }}>
        {timeLeft.days > 0 && `${timeLeft.days} days `}
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    );
  };

  const calculateLastPaymentDate = (nextPaymentDate, frequency) => {
    const nextDate = new Date(nextPaymentDate);
    let lastPaymentDate;

    if (frequency === 'Weekly') {
        lastPaymentDate = new Date(nextDate.setDate(nextDate.getDate() - 7));
    } else if (frequency === 'Monthly') {
        lastPaymentDate = new Date(nextDate.setMonth(nextDate.getMonth() - 1));
    } else if (frequency === 'Every Minute') {
        lastPaymentDate = new Date(nextDate.setMinutes(nextDate.getMinutes() - 1));
    }

    return lastPaymentDate;
};
  const calculateDeadline = (nextPaymentDate, frequency) => {
    const nextDate = new Date(nextPaymentDate);
    const currentDate = new Date();
    let deadline;

    if (currentDate > nextDate) {
        if (frequency === 'Weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (frequency === 'Monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (frequency === 'Every Minute') {
            nextDate.setMinutes(nextDate.getMinutes() + 1);
        }
    }

    deadline = nextDate.getTime();
    return deadline;
};

  const deadline = calculateDeadline(nextPaymentDate, frequency);
  const lastPaymentDate = calculateLastPaymentDate(nextPaymentDate, frequency);

  const onFinish = async () => {
    notification.warning({
      message: 'Payment Due',
      description: 'You have a payment due today! Automatically adding the transaction to your expenses.',
      duration: 10
    });
    const user = JSON.parse(localStorage.getItem('users'));

    try {
      const newTransaction = {
        userid: user._id,
        amount: amount,
        type: 'Expense',
        category: category,
        date: formatDate(nextPaymentDate),
        description: description,
      };

      const response = await axios.post('/api/transactions/add-transaction', newTransaction);
      console.log('Transaction created successfully:', response.data);
    } catch (error) {
      console.error('Error adding transaction:', error);
      message.error('An error occurred while adding the transaction');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
        return '#c1c1c1';
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
      default:
        return '#000';
    }
  };

  const incomeCategoryIcons = {
    'Food & Drink': <FontAwesomeIcon icon={faUtensils} className="white-icon" />,
    'Restaurants': <FontAwesomeIcon icon={faBowlFood} className="white-icon" />,
    'Coffee & Bars': <FontAwesomeIcon icon={faGlassWater} className="white-icon" />,
    'Groceries': <FontAwesomeIcon icon={faShoppingBasket} className="white-icon" />,
    'Shopping': <FontAwesomeIcon icon={faCartShopping} className="white-icon" />,
    'Clothes & Shoes': <FontAwesomeIcon icon={faShirt} className="white-icon" />,
    'Electronics': <FontAwesomeIcon icon={faLightbulb} className="white-icon" />,
    'Sports': <FontAwesomeIcon icon={faBaseball} className="white-icon" />,
    'Kids': <FontAwesomeIcon icon={faBaby} className="white-icon" />,
    'Gifts': <FontAwesomeIcon icon={faGift} className="white-icon" />,
    'Housing': <FontAwesomeIcon icon={faHome} className="white-icon" />,
    'Mortgage & Rent': <FontAwesomeIcon icon={faHomeUser} className="white-icon" />,
    'Home Supplies': <FontAwesomeIcon icon={faBoxesPacking} className="white-icon" />,
    'Home Services': <FontAwesomeIcon icon={faToiletPaper} className="white-icon" />,
    'Rent the House': <FontAwesomeIcon icon={faHome} className="white-icon" />,
    'Transportation': <FontAwesomeIcon icon={faBus} className="white-icon" />,
    'Business Trips': <FontAwesomeIcon icon={faTruckPlane} className="white-icon" />,
    'Public Transportation': <FontAwesomeIcon icon={faTrainSubway} className="white-icon" />,
    'Family Trips': <FontAwesomeIcon icon={faCar} className="white-icon" />,
    'Vehicle': <FontAwesomeIcon icon={faCarSide} className="white-icon" />,
    'Fuel': <FontAwesomeIcon icon={faGasPump} className="white-icon" />,
    'Service & Parts': <FontAwesomeIcon icon={faCartShopping} className="white-icon" />,
    'Life & Entertainment': <FontAwesomeIcon icon={faSmile} className="white-icon" />,
    'Sports': <FontAwesomeIcon icon={faBaseballBatBall} className="white-icon" />,
    'TV & Netflix': <FontAwesomeIcon icon={faTv} className="white-icon" />,
    'Games': <FontAwesomeIcon icon={faGamepad} className="white-icon" />,
    'Doctor & Healthcare': <FontAwesomeIcon icon={faHospital} className="white-icon" />,
    'Financial Expense': <FontAwesomeIcon icon={faDollarSign} className="white-icon" />,
    'Bank Fee': <FontAwesomeIcon icon={faBank} className="white-icon" />,
    'Interest Payment': <FontAwesomeIcon icon={faCreditCard} className="white-icon" />,
    'Child Support': <FontAwesomeIcon icon={faBaby} className="white-icon" />,
    'Tax': <FontAwesomeIcon icon={faMoneyBill} className="white-icon" />,
    'Insurance': <FontAwesomeIcon icon={faIdCard} className="white-icon" />,
    'Loan': <FontAwesomeIcon icon={faLandmark} className="white-icon" />,
    'Incomes': <FontAwesomeIcon icon={faCoins} className="white-icon" />,
    'Salary': <FontAwesomeIcon icon={faMoneyBill} className="white-icon" />,
    'Rental Income': <FontAwesomeIcon icon={faHouseChimneyUser} className="white-icon" />,
    'Interest': <FontAwesomeIcon icon={faCreditCard} className="white-icon" />,
    'Lottery': <FontAwesomeIcon icon={faDice} className="white-icon" />,
    'Transfer': <FontAwesomeIcon icon={faMoneyBillTransfer} className="white-icon" />,
  };

  const renderCategoryIcon = (category) => {
    let iconClassName = 'category-icon';
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

  return (
    <Card className="plan-item-card">
      <Row gutter={16}>
        <Col span={24}>
          <h3>{renderCategoryIcon(category)}{category}</h3>
          <p3>${amount}<p4>/{frequency}</p4></p3>
          <div className="dot-container">
            <img className="dot" src={dot} alt="Dot" />
          </div>
          <p6><b>Description:  </b>{description}</p6>
          <div className="dot-container">
            <img className="dot" src={dot} alt="Dot" />
          </div>
          <p6><b>Fisrt Payment Date: </b>{formatDate(lastPaymentDate)}</p6>
          <div className="dot-container">
            <img className="dot" src={dot} alt="Dot" />
          </div>
          <p6><b>Next Payment Date: </b>{formatDate(nextPaymentDate)}</p6>
          <div className="dot-container">
            <img className="dot" src={dot} alt="Dot" />
          </div>
          <p6><b>Remaining: </b><CustomCountdown className='countdown' deadline={deadline} onFinish={onFinish} /></p6>
        </Col>
      </Row>
      <div className="btn_container">
        <button className="btn_del" onClick={handleDelete}>
          Cancel Plan
        </button>
      </div>
    </Card>
  );
};

export default PlanItem;
