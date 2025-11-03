import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// @desc    Update customer profile
// @route   PUT /api/users/:id
// @access  Private (should add auth middleware)
const updateCustomerProfile = asyncHandler(async (req, res) => {
    // Authorization check
    if (req.user.id !== req.params.id && req.userType !== 'moderator') {
        res.status(403);
        throw new Error('Forbidden: You can only update your own profile.');
    }

    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.address = req.body.address || user.address;
        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle user status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.status = user.status === 'Active' ? 'Suspended' : 'Active';
        await user.save();
        res.json({ message: 'User status updated' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


export { updateCustomerProfile, toggleUserStatus };