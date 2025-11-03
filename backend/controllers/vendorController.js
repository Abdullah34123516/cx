import asyncHandler from 'express-async-handler';
import Vendor from '../models/vendorModel.js';

// @desc    Update vendor profile (by vendor)
// @route   PUT /api/vendors/profile
// @access  Private (Vendor only, token-based)
const updateVendorProfile = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.user._id);

    if (vendor) {
        vendor.name = req.body.name || vendor.name;
        vendor.address = req.body.address || vendor.address;
        vendor.phone = req.body.phone || vendor.phone;
        // Check for undefined to allow clearing the number
        if (req.body.bKashNumber !== undefined) {
            vendor.bKashNumber = req.body.bKashNumber;
        }
        if (req.body.avatar) {
            vendor.avatar = req.body.avatar;
        }

        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

// @desc    Update vendor working hours
// @route   PUT /api/vendors/working-hours
// @access  Private (Vendor only, token-based)
const updateWorkingHours = asyncHandler(async (req, res) => {
    const { workingHours } = req.body;
    const vendor = await Vendor.findById(req.user._id);
    if (vendor) {
        vendor.workingHours = workingHours;
        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } else {
        res.status(404); throw new Error('Vendor not found');
    }
});

// @desc    Update vendor realtime status
// @route   PUT /api/vendors/realtime-status
// @access  Private (Vendor only, token-based)
const updateRealtimeStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const vendor = await Vendor.findById(req.user._id);
    if (vendor) {
        vendor.realtimeStatus = status;
        await vendor.save();
        res.json({ message: 'Status updated' });
    } else {
        res.status(404); throw new Error('Vendor not found');
    }
});

// @desc    Toggle vendor auto-accept jobs
// @route   PUT /api/vendors/auto-accept
// @access  Private (Vendor only, token-based)
const toggleAutoAccept = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.user._id);
    if (vendor) {
        vendor.autoAcceptJobs = !vendor.autoAcceptJobs;
        await vendor.save();
        res.json({ message: 'Auto-accept toggled' });
    } else {
        res.status(404); throw new Error('Vendor not found');
    }
});

// @desc    Toggle vendor status by Admin
// @route   PUT /api/vendors/:id/status
// @access  Private (Admin only)
const toggleVendorStatus = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        vendor.status = vendor.status === 'Active' ? 'Suspended' : 'Active';
        await vendor.save();
        res.json({ message: 'Vendor status updated' });
    } else {
        res.status(404); throw new Error('Vendor not found');
    }
});

// @desc    Update vendor coverage by Admin
// @route   PUT /api/vendors/:id/coverage
// @access  Private (Admin only)
const updateCoverage = asyncHandler(async (req, res) => {
    const { areaIds } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        vendor.coverageArea = areaIds;
        await vendor.save();
        res.json({ message: 'Coverage updated' });
    } else {
        res.status(404); throw new Error('Vendor not found');
    }
});

// @desc    Update vendor details by Admin
// @route   PUT /api/vendors/:id
// @access  Private (Admin only)
const updateVendorDetailsByAdmin = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        vendor.name = req.body.name || vendor.name;
        if (req.body.email) {
            vendor.email = req.body.email.toLowerCase();
        }
        vendor.phone = req.body.phone || vendor.phone;
        vendor.address = req.body.address || vendor.address;
        vendor.voterIdNumber = req.body.voterIdNumber || vendor.voterIdNumber;
        vendor.voterIdPhotoUrl = req.body.voterIdPhotoUrl || vendor.voterIdPhotoUrl;
        
        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});


export { 
    updateVendorProfile,
    updateWorkingHours,
    updateRealtimeStatus,
    toggleAutoAccept,
    toggleVendorStatus,
    updateCoverage,
    updateVendorDetailsByAdmin
};