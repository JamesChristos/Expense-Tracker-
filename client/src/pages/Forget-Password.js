import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import "../resources/authentication.css";

const ForgetPass = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmailFormat = (value) => {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const onFinished = async () => {
        if (!email) {
            setEmailError('Please fill in your email');
            return;
        }
        if (!validateEmailFormat(email)) {
            return;
        }
        try {
            const response = await axios.post('/api/users/forget-password', { email });
            message.success(response.data.message);
            navigate('/login');
        } catch (error) {
            message.error(error.response.data.error || 'Failed to send reset link');
        }
    }

    return (
        <div className='flex flex-col mb-10 mr-10'>
            <div className='font-bold text-2xl font-inter'>
                Reset Password <b className='text-white'>hsdhhsdahdsda</b>
            </div>
            <div className='text-425466 font-inter font-semibold text-xs mt-2'>
                Enter the email that you want to reset password
            </div>
            <label className='flex flex-col mt-8 text-425466 text-xs font-inter font-semibold'>E-mail</label>
            <input
                className="custom-input mt-2"
                placeholder="Type your e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div className="text-red-500 mb-8">{emailError}</div>

            <button className="sign-in-button" onClick={onFinished}>Send</button>
            <p className="text-sm mt-8 font-inter font-semibold items-center ml-20 text-718096">Don't have an account?<Link to="/register"><button className="Link-Signup ml-2 text-black font-semibold">Sign Up</button></Link></p>
            <p className='text-sm mt-2 font-inter font-semibold items-center text-center text-718096'>Or go back to<Link to="/login"><button className="Link-Signup ml-2 text-black font-semibold">Sign In</button></Link></p>
        </div>
    );
}

export default ForgetPass;
