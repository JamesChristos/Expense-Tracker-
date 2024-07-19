import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleLogo from "../assets/google_logo.png";
import axios from "axios";
import { message } from "antd";
import "../resources/authentication.css";

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateEmailFormat = (value) => {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            message.warning("Please enter a valid email address");
            return false;
        }
        setEmailError("");
        return true;
    };

    const validatePasswordFormat = (value) => {
        if (!value || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
            message.warning("Password must be alphanumerical and at least 8 characters.");
            return false;
        }
        return true;
    };

    const onFinished = async () => {
        if (!name || !email || !password) {
            message.warning("Please fill in all required fields.");
            return;
        }

        if (!validateEmailFormat(email) || !validatePasswordFormat(password)) {
            return;
        }

        try {
            const response = await axios.post("/api/users/register", {
                name,
                email,
                password,
            });
            localStorage.setItem("users", JSON.stringify(response.data));
            navigate("/login");
            message.success(response.data.name + " has been registered");
        } catch (error) {
            if (error.response.status === 409) {
                message.warning("Email is already in use. Please choose a different email.");
            } else {
                message.error("An error occurred during registration.");
            }
        }
    };

    useEffect(() => {
        if (localStorage.getItem("users")) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="flex flex-col mt-14 mr-10">
            <div className="font-bold text-2xl font-inter">
                Want To Control Your Finance?
            </div>
            <div className="text-425466 font-inter font-semibold text-xs mt-2">
                Create Your Finance Account
            </div>
            <label className="flex flex-col mt-8 text-425466 text-xs font-inter font-semibold">
                Username
            </label>
            <input
                className="custom-input mt-2"
                placeholder="Type your username"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className="text-red-500">{nameError}</div>
            <label className="flex flex-col mt-8 text-425466 text-xs font-inter font-semibold">
                E-mail
            </label>
            <input
                className="custom-input mt-2"
                placeholder="Type your e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div className="text-red-500">{emailError}</div>
            <label className="flex flex-col text-xs mt-8 text-425466 font-inter font-semibold">
                Password
            </label>
            <div className="relative">
                <input
                    id="passwordInput"
                    className="custom-input mt-2"
                    placeholder="Type your password"
                    type={showPassword ? "text" : "password"}
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
            <div className="flex justify-end">
                <Link className="text-xs mt-2 mb-6 font-inter font-md text-777E90"></Link>
            </div>
            <button className="sign-in-button" onClick={onFinished}>Sign Up</button>
            <p className="text-sm mt-3 font-inter font-semibold items-center ml-20 text-718096">
                Already have an account?
                <Link to="/login">
                    <button className="Link-Signup ml-2 text-black font-semibold">Sign In</button>
                </Link>
            </p>
        </div>
    );
};

export default Register;
