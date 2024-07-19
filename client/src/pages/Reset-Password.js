import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import "../resources/authentication.css";

const ResetPass = () => {
    const navigate = useNavigate();
    const { id, token } = useParams();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const validatePasswordFormat = (value) => {
        if (!value || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
            setPasswordError('Password must be alphanumerical at least 8 characters.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const onFinished = async () => {
        if (!password || !newPassword) {
            message.error('Please fill in all required fields');
            return;
        }

        if (!validatePasswordFormat(password) || !validatePasswordFormat(newPassword)) {
            return;
        }

        if (password !== newPassword) {
            setNewPasswordError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`/api/users/reset-password/${id}/${token}`, { password, confirmPassword: newPassword });
            message.success('Password Reset Successfully! Please login to continue.');
            navigate('/login');
        } catch (error) {
            message.error(error.response?.data?.error || 'Password reset failed');
        }
    };

    return (
        <div className='flex flex-col mb-10 mr-10'>
            <div className='font-bold text-2xl font-inter'>
                Reset Password <b className='text-white'>sdsadsdasdsd</b>
            </div>
            <label className='flex flex-col mt-8 text-425466 text-xs font-inter font-semibold'>New Password</label>
            <div className="relative">
                <input
                    className="custom-input mt-2"
                    placeholder="Type your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span
                    className="absolute top-5 right-5 cursor-pointer"
                    onClick={togglePasswordVisibility}
                >
                    {showPassword ? (
                        <i className="fas fa-eye"></i>
                    ) : (
                        <i className="fas fa-eye-slash"></i>
                    )}
                </span>
            </div>
            <div className="text-red-500">{passwordError}</div>
            <label className='flex flex-col text-xs mt-8 text-425466 font-inter font-semibold'>Confirm Password</label>
            <div className="relative">
                <input
                    className="custom-input mt-2"
                    placeholder="Type your password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                    className="absolute top-5 right-5 cursor-pointer"
                    onClick={toggleNewPasswordVisibility}
                >
                    {showNewPassword ? (
                        <i className="fas fa-eye"></i>
                    ) : (
                        <i className="fas fa-eye-slash"></i>
                    )}
                </span>
            </div>
            <div className="text-red-500 mb-10">{newPasswordError}</div>
            <button className="sign-in-button" onClick={onFinished}>Send</button>
            <p className="text-sm mt-8 font-inter font-semibold items-center ml-20 text-718096">Don't have an account?<Link to="/register"><button className="Link-Signup ml-2 text-black font-semibold">Sign Up</button></Link></p>
            <p className='text-sm mt-2 font-inter font-semibold items-center text-center text-718096'>Or go back to<Link to="/login"><button className="Link-Signup ml-2 text-black font-semibold">Sign In</button></Link></p>
        </div>
    );
};

export default ResetPass;
