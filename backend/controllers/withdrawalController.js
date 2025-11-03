import asyncHandler from 'express-async-handler';
import Withdrawal from '../models/withdrawalModel.js';
import Vendor from '../models/vendorModel.js';

// @desc    Create a new withdrawal request
// @route   POST /api/withdrawals
// @access  Private (Vendor)
const createWithdrawalRequest = asyncHandler(async (req, res) => {
    const { vendorId, amount, bKashNumber } = req.body;
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        res.status(404);
        throw new Error('Vendor not found');
    }
    if (amount > vendor.earnings.pending) {
        res.status(400);
        throw new Error('Insufficient balance for withdrawal');
    }

    const withdrawal = await Withdrawal.create({
        vendorId,
        amount,
        accountNumber: bKashNumber,
    });
    
    // Deduct from pending balance
    vendor.earnings.pending -= amount;
    await vendor.save();

    res.status(201).json(withdrawal);
});

// @desc    Approve a withdrawal request
// @route   PUT /api/withdrawals/:id/approve
// @access  Private (Admin)
const approveWithdrawalRequest = asyncHandler(async (req, res) => {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (withdrawal) {
        withdrawal.status = 'Completed';
        await withdrawal.save();
        res.json({ message: 'Withdrawal approved' });
    } else {
        res.status(404);
        throw new Error('Withdrawal request not found');
    }
});

export { createWithdrawalRequest, approveWithdrawalRequest };