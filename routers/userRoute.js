const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = 'hsdabfkasbfaksjfbaksjbkafbksfbnakfqwn123fnkfbn1i14bn'

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'group9wct@gmail.com',
    pass: 'hrpx lmwx bmcl eear',
  },
});

router.post('/login', async function (req, res) {
  try {
    const result = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (result) {
      res.send(result)
    } else {
      res.status(500).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

router.post('/register', async function (req, res) {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already exists' });
    }

    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

router.post('/forget-password', async function (req, res) {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });

    if (!oldUser) {
      return res.status(404).json({ error: 'User Not Found' });
    }

    const secret = JWT_SECRET + oldUser.password;
    const payload = {
      email: oldUser.email,
      id: oldUser._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    const link = `http://localhost:3000/reset-password/${oldUser._id}/${token}`;
    console.log(link);

    const mailOptions = {
      from: 'group9wct@gmail.com',
      to: oldUser.email,
      subject: 'Password Reset Link',
      text: `Click the following link to reset your password: ${link}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send reset link', detailedError: error });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Password reset link sent successfully' });
      }
    });
  } catch (error) {
    console.error('Forget Password Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/reset-password/:id/:token', async function (req, res) {
  const { id, token } = req.params;
  try {
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secret = JWT_SECRET + oldUser.password;
    const payload = jwt.verify(token, secret);
    res.json({ email: payload.email });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/reset-password/:id/:token", async function (req, res) {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    console.log("Received password reset request:", { id, token, password });

    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const secret = JWT_SECRET + oldUser.password;
    console.log("Verifying token with secret:", secret);

    const payload = jwt.verify(token, secret);
    console.log("Token verification successful. Payload:", payload);

    // Update the user's password
    oldUser.password = password;
    await oldUser.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in password reset route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;