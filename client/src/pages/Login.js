import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import googleLogo from "../assets/google_logo.png";
import axios from 'axios';
import { message } from 'antd';
import "../resources/authentication.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateEmailFormat = (value) => {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            message.warning('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePasswordFormat = (value) => {
        if (!value || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
            message.warning('Password must be alphanumerical at least 8 characters.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const onFinished = async () => {
        if (!email) {
            message.warning('Please fill in your email');
        }

        if (!password) {
            message.warning('Please fill in your password');
        }

        if (!email || !password) {
            return;
        }

        if (!validateEmailFormat(email) || !validatePasswordFormat(password)) {
            return;
        }

        try {
            const response = await axios.post('/api/users/login', { email, password });
            localStorage.setItem('users', JSON.stringify(response.data));
            navigate('/');
            message.success('You have been logged in');
        } catch (error) {
            message.error(error.response.data.error || 'Login Failed');
        }
    };

    useEffect(() => {
        if (localStorage.getItem('users')) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className='flex flex-col mt-14 mr-10'>
            <div className='font-bold text-2xl font-inter'>
                Welcome back! <b className='text-white'>idiasdsadsdsdd</b>
            </div>
            <div className='text-425466 font-inter font-semibold text-xs mt-2'>
                Log In Into Your Account
            </div>
            <label className='flex flex-col mt-8 text-425466 text-xs font-inter font-semibold'>E-mail</label>
            <input
                className="custom-input mt-2"
                placeholder="Type your e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div className="text-red-500">{emailError}</div>
            <label className='flex flex-col text-xs mt-8 text-425466 font-inter font-semibold'>Password</label>
            <div className="relative">
                <input
                    className="custom-input mt-2"
                    placeholder="Type your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span
                    className="absolute top-6 right-5 cursor-pointer"
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
            <div className="flex justify-end">
                <Link to='/forget-password' className="text-xs mt-2 mb-6 font-inter font-md text-777E90">Forget Password?</Link>
            </div>
            <button className="sign-in-button" onClick={onFinished}>Sign In</button>
            {/* <div className="mt-10 flex justify-center items-center">
                <hr className="w-1/4 border-EDF2F7 border-solid border-r-2" />
                <p className="mx-2 text-xs text-718096">or do it via other accounts</p>
                <hr className="w-1/4 border-EDF2F7 border-solid border-l-2" />
            </div>
            <div className="mt-8 flex justify-center">
                <img 
                    className='cursor-pointer w-14 h-14 rounded-full hover:shadow-md transition duration-300 ease-in-out hover:scale-105 hover:rotate-12 hover:opacity-80'
                    style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                    src={googleLogo}
                    alt="Google"
                />
            </div> */}
            <p className="text-sm mt-3 font-inter font-semibold items-center ml-20 text-718096">Don't have an account?<Link to="/register"><button className="Link-Signup ml-2 font-semibold">Sign Up</button></Link></p>
        </div>
    );
}

export default Login;
