

import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/userModel.js';
import Vendor from '../models/vendorModel.js';
import Booking from '../models/bookingModel.js';
import VendorApplication from '../models/vendorApplicationModel.js';
import Service from '../models/serviceModel.js';
import ServiceArea from '../models/serviceAreaModel.js';
import Withdrawal from '../models/withdrawalModel.js';
import Moderator from '../models/moderatorModel.js';
import ChatSession from '../models/chatSessionModel.js';

// @desc    Fetch public data for landing page
// @route   GET /api/platform/landing-data
// @access  Public
const getLandingPageData = asyncHandler(async (req, res) => {
    const [services, serviceAreas] = await Promise.all([
        Service.find({}),
        ServiceArea.find({ status: 'Active' }),
    ]);

    res.json({ 
        services: services.map(s => s.toJSON()), 
        serviceAreas: serviceAreas.map(sa => sa.toJSON()) 
    });
});


// @desc    Fetch all platform data
// @route   GET /api/platform/data
// @access  Private
const getPlatformData = asyncHandler(async (req, res) => {
    // In a real large-scale app, this might be broken down
    // or use more advanced aggregation/caching.
    const [
        users,
        vendors,
        bookings,
        vendorApplications,
        services,
        serviceAreas,
        withdrawals,
        moderators,
        chatSessions,
    ] = await Promise.all([
        User.find({}).populate({
            path: 'bookingHistory',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'service',
                model: 'Service'
            }
        }),
        Vendor.find({}).populate({
            path: 'serviceHistory',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'service',
                model: 'Service'
            }
        }),
        Booking.find({}).sort({ createdAt: -1 }).populate('service').populate('customerId'),
        VendorApplication.find({}),
        Service.find({}),
        ServiceArea.find({}),
        Withdrawal.find({}),
        Moderator.find({}).select('-password -sessionToken'),
        ChatSession.find({})
    ]);

    // Mocked total revenue for now
    const totalRevenue = 540000;
    const totalCommission = 65000;
    const totalSubscriptionRevenue = 25000;

    // Explicitly call .toJSON() to ensure all transformations defined in the models are applied.
    // This is crucial for consistency, especially with populated fields and ObjectId conversions.
    const platformData = {
        users: users.map(doc => doc.toJSON()),
        vendors: vendors.map(doc => doc.toJSON()),
        bookings: bookings.map(doc => doc.toJSON()),
        vendorApplications: vendorApplications.map(doc => doc.toJSON()),
        services: services.map(doc => doc.toJSON()),
        serviceAreas: serviceAreas.map(doc => doc.toJSON()),
        withdrawals: withdrawals.map(doc => doc.toJSON()),
        moderators: moderators.map(doc => doc.toJSON()),
        chatSessions: chatSessions.map(doc => doc.toJSON()),
        moderatorActivityLog: [], // TODO: Implement activity log model
        totalRevenue,
        totalCommission,
        totalSubscriptionRevenue,
    };

    res.json(platformData);
});


// @desc    Create a new vendor application
// @route   POST /api/platform/vendor-applications
// @access  Public
const createVendorApplication = asyncHandler(async (req, res) => {
    const applicationData = req.body;
    
    // Sanitize email input
    if (applicationData.email) {
        applicationData.email = applicationData.email.trim().toLowerCase();
    }
    const { otp, name, phone, voterIdNumber, email } = applicationData;

    // Add OTP verification for security
    if (otp !== '1234') {
        res.status(401);
        throw new Error('Invalid OTP provided with application.');
    }

    // Basic validation
    if (!name || !phone || !voterIdNumber) {
        res.status(400);
        throw new Error('Missing required application fields');
    }

    const existingApplicationByPhone = await VendorApplication.findOne({ phone: phone });
    const existingVendorByPhone = await Vendor.findOne({ phone: phone });
    const existingUserByPhone = await User.findOne({ phone: phone });

    if(existingApplicationByPhone || existingVendorByPhone || existingUserByPhone) {
        res.status(400);
        throw new Error('An application or user with this phone number already exists.');
    }

    // Check for existing email if provided
    if (email) {
        const existingApplicationByEmail = await VendorApplication.findOne({ email });
        const existingVendorByEmail = await Vendor.findOne({ email });
        const existingModeratorByEmail = await Moderator.findOne({ email });

        if (existingApplicationByEmail || existingVendorByEmail || existingModeratorByEmail) {
            res.status(400);
            throw new Error('An application or user with this email address already exists.');
        }
    }

    // Ensure OTP is not saved to the database
    const dataToSave = { ...applicationData };
    delete dataToSave.otp;

    const newApplication = await VendorApplication.create(dataToSave);
    
    if (newApplication) {
        res.status(201).json(newApplication);
    } else {
        res.status(400);
        throw new Error('Could not create application.');
    }
});

// @desc    Approve a vendor application
// @route   PUT /api/platform/vendor-applications/:id/approve
// @access  Private/Admin
const approveApplication = asyncHandler(async (req, res) => {
    const application = await VendorApplication.findById(req.params.id);

    if (application) {
        // Final check for email duplication before creating vendor
        const trimmedEmail = application.email.trim().toLowerCase();
        const existingVendorByEmail = await Vendor.findOne({ email: trimmedEmail });
        const existingModeratorByEmail = await Moderator.findOne({ email: trimmedEmail });
        
        if (existingVendorByEmail || existingModeratorByEmail) {
            await application.deleteOne();
            res.status(409); // 409 Conflict
            throw new Error(`A user with email ${trimmedEmail} already exists. The conflicting application has been removed.`);
        }

        const newVendor = await Vendor.create({
            name: application.name,
            phone: application.phone,
            email: trimmedEmail,
            address: application.address,
            avatar: application.avatar,
            skills: application.skills,
            coverageArea: application.coverageArea,
            voterIdPhotoUrl: application.voterIdPhotoUrl,
            voterIdNumber: application.voterIdNumber,
            experienceYears: application.experienceYears,
            hasSmartphone: application.hasSmartphone,
            hasBikeOrCycle: application.hasBikeOrCycle,
            applicationStatus: 'Approved',
            verificationStatus: 'Verified',
            rating: 5,
            workingHours: {
                Sunday: { active: false, start: '09:00', end: '17:00' },
                Monday: { active: true, start: '09:00', end: '17:00' },
                Tuesday: { active: true, start: '09:00', end: '17:00' },
                Wednesday: { active: true, start: '09:00', end: '17:00' },
                Thursday: { active: true, start: '09:00', end: '17:00' },
                Friday: { active: false, start: '09:00', end: '17:00' },
                Saturday: { active: true, start: '09:00', end: '17:00' },
            },
            earnings: { total: 0, pending: 0, lastMonth: 0 },
            subscription: { planName: 'Basic', commissionRate: 0.20, monthlyFee: 0 },
            status: 'Active',
            realtimeStatus: 'Offline'
        });
        
        await application.deleteOne();

        res.status(201).json(newVendor);
    } else {
        res.status(404);
        throw new Error('Application not found');
    }
});

// @desc    Reject a vendor application
// @route   PUT /api/platform/vendor-applications/:id/reject
// @access  Private/Admin
const rejectApplication = asyncHandler(async (req, res) => {
    const application = await VendorApplication.findById(req.params.id);

    if (application) {
        await application.deleteOne();
        res.json({ message: 'Application rejected' });
    } else {
        res.status(404);
        throw new Error('Application not found');
    }
});


export { getLandingPageData, getPlatformData, createVendorApplication, approveApplication, rejectApplication };