
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/userModel.js';
import Vendor from '../models/vendorModel.js';
import Moderator from '../models/moderatorModel.js';
import VendorApplication from '../models/vendorApplicationModel.js';


// @desc    Request an OTP for a given phone number
// @route   POST /api/auth/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    
    // Check if user or vendor exists
    const user = await User.findOne({ phone });
    const vendor = await Vendor.findOne({ phone });
    const application = await VendorApplication.findOne({ phone });

    // In a real app, you would integrate with an SMS gateway like Twilio
    console.log(`Sending OTP to ${phone}. Mock OTP is 1234`);

    res.status(200).json({ userExists: !!user || !!vendor || !!application });
});

// @desc    Check for duplicate vendor credentials before signup
// @route   POST /api/auth/check-vendor-duplicates
// @access  Public
const checkVendorDuplicates = asyncHandler(async (req, res) => {
    const { phone, email } = req.body;

    const sanitizedEmail = email.trim().toLowerCase();

    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) return res.json({ isDuplicate: true, field: 'phone', message: 'This phone number is already registered as a customer.' });
    
    const existingVendorByPhone = await Vendor.findOne({ phone });
    if (existingVendorByPhone) return res.json({ isDuplicate: true, field: 'phone', message: 'A vendor with this phone number already exists.' });

    const existingAppByPhone = await VendorApplication.findOne({ phone });
    if (existingAppByPhone) return res.json({ isDuplicate: true, field: 'phone', message: 'An application with this phone number is already pending.' });

    const existingVendorByEmail = await Vendor.findOne({ email: sanitizedEmail });
    if (existingVendorByEmail) return res.json({ isDuplicate: true, field: 'email', message: 'A vendor with this email address already exists.' });

    const existingAppByEmail = await VendorApplication.findOne({ email: sanitizedEmail });
    if (existingAppByEmail) return res.json({ isDuplicate: true, field: 'email', message: 'An application with this email address is already pending.' });

    const existingModeratorByEmail = await Moderator.findOne({ email: sanitizedEmail });
    if (existingModeratorByEmail) return res.json({ isDuplicate: true, field: 'email', message: 'This email address is already in use.' });

    // If no duplicates found, proceed
    console.log(`No duplicates found for ${phone} / ${email}. Sending OTP. Mock OTP is 1234.`);
    res.status(200).json({ isDuplicate: false });
});


// @desc    Verify OTP and log in the user/vendor
// @route   POST /api/auth/verify-login
// @access  Public
const verifyLogin = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    // Mock OTP verification
    if (otp !== '1234') {
        res.status(401);
        throw new Error('Invalid OTP');
    }
    
    // Check for pending application first, and reject login if found.
    const application = await VendorApplication.findOne({ phone });
    if (application) {
        res.status(403); // Forbidden
        throw new Error('Your application is still pending review. Please check back later.');
    }
    
    const token = crypto.randomBytes(32).toString('hex');

    const user = await User.findOne({ phone });
    if (user) {
        user.sessionToken = token;
        await user.save();
        return res.json({ user, token });
    }
    
    const vendor = await Vendor.findOne({ phone });
    if (vendor) {
        vendor.sessionToken = token;
        await vendor.save();
        return res.json({ user: vendor, token });
    }

    res.status(404);
    throw new Error('User not found. Please create an account.');
});

// @desc    Create a new user (customer)
// @route   POST /api/auth/signup
// @access  Public
const signupUser = asyncHandler(async (req, res) => {
    const { name, phone, address, otp, avatar } = req.body;

    // Mock OTP verification
    if (otp !== '1234') {
        res.status(401);
        throw new Error('Invalid OTP');
    }
    
    const userExists = await User.findOne({ phone });
    if (userExists) {
        res.status(400);
        throw new Error('User with this phone number already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
        name,
        phone,
        address,
        avatar: avatar || '', // Use uploaded avatar or set to empty string
        sessionToken: token,
    });

    if (newUser) {
        res.status(201).json({ user: newUser, token });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Log in a moderator
// @route   POST /api/auth/moderator/login
// @access  Public
const loginModerator = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const moderator = await Moderator.findOne({ email: email.toLowerCase() });

    // In a real app, you'd use bcrypt to compare passwords
    if (moderator && moderator.password === password) {
        const token = crypto.randomBytes(32).toString('hex');
        moderator.sessionToken = token;
        await moderator.save();

        res.json({ moderator, token });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});


export { requestOtp, verifyLogin, signupUser, loginModerator, checkVendorDuplicates };
