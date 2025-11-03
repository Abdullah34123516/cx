import express from 'express';
import asyncHandler from 'express-async-handler';
import { 
    updateVendorProfile, 
    updateWorkingHours, 
    updateRealtimeStatus, 
    toggleAutoAccept,
    toggleVendorStatus,
    updateCoverage,
    updateVendorDetailsByAdmin
} from '../controllers/vendorController.js';
import Vendor from '../models/vendorModel.js';
import Moderator from '../models/moderatorModel.js';

// Middleware to protect routes and ensure the user is an authenticated vendor
const protectVendor = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const vendor = await Vendor.findOne({ sessionToken: token });

            if (!vendor) {
                res.status(401);
                throw new Error('Not authorized, token failed for vendor');
            }
            
            req.user = vendor; // Attach vendor to request object
            next();

        } catch (error) {
            res.status(401);
            throw new Error(error.message || 'Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});


// Middleware for admin/moderator access
const adminProtect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const moderator = await Moderator.findOne({ sessionToken: token });
            if (!moderator) {
                res.status(401);
                throw new Error('Not authorized, not a moderator');
            }
            req.user = moderator;
            next();
        } catch (error) {
            res.status(401);
            throw new Error(error.message || 'Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});


const router = express.Router();

// Routes for a vendor to update their own profile (token-based)
router.route('/profile').put(protectVendor, updateVendorProfile);
router.route('/working-hours').put(protectVendor, updateWorkingHours);
router.route('/realtime-status').put(protectVendor, updateRealtimeStatus);
router.route('/auto-accept').put(protectVendor, toggleAutoAccept);

// Admin-only routes for managing vendors (ID-based)
router.route('/:id/status').put(adminProtect, toggleVendorStatus);
router.route('/:id/coverage').put(adminProtect, updateCoverage);
router.route('/:id').put(adminProtect, updateVendorDetailsByAdmin);


export default router;