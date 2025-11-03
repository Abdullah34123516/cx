import express from 'express';
import asyncHandler from 'express-async-handler';
import { uploadFile } from '../controllers/uploadController.js';
import User from '../models/userModel.js';
import Vendor from '../models/vendorModel.js';
import Moderator from '../models/moderatorModel.js';
import VendorApplication from '../models/vendorApplicationModel.js';

const uploadProtect = asyncHandler(async (req, res, next) => {
    // Case 1: Standard authentication with token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            
            const user = await User.findOne({ sessionToken: token }).select('-sessionToken');
            if (user) { req.user = user; return next(); }

            const vendor = await Vendor.findOne({ sessionToken: token }).select('-sessionToken');
            if (vendor) { req.user = vendor; return next(); }
            
            const moderator = await Moderator.findOne({ sessionToken: token }).select('-sessionToken');
            if (moderator) { req.user = moderator; return next(); }

            // If token is present but invalid
            res.status(401);
            throw new Error('Not authorized, token failed');
        } catch (error) {
            res.status(401);
            throw new Error(error.message || 'Not authorized, token failed');
        }
    }

    // Case 2 & 3: Unauthenticated signup uploads
    const { phone, otp, file, contentType, fileName } = req.body;

    // Basic validation for upload payload
    if (!file || !contentType || !fileName) {
        res.status(400);
        throw new Error('Missing file data for upload.');
    }

    if (phone && otp) {
        // Case 2: New customer signup
        if (otp === '1234') { // Mock OTP check
            const userExists = await User.findOne({ phone });
            const vendorExists = await Vendor.findOne({ phone });
            if (userExists || vendorExists) {
                res.status(403);
                throw new Error('A user with this phone number already exists.');
            }
            // It's a valid new customer signup upload
            return next();
        }

        // Case 3: New vendor signup
        if (otp === 'vendor-signup') {
            const vendorExists = await Vendor.findOne({ phone });
            const appExists = await VendorApplication.findOne({ phone });
            if (vendorExists || appExists) {
                 res.status(403);
                throw new Error('A vendor or application with this phone number already exists.');
            }
            // It's a valid new vendor signup upload
            return next();
        }
    }

    // If none of the above, deny access
    res.status(401);
    throw new Error('Not authorized, no token or valid signup credentials');
});


const router = express.Router();

router.route('/').post(uploadProtect, uploadFile);

export default router;
