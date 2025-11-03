import asyncHandler from 'express-async-handler';
import Moderator from '../models/moderatorModel.js';

// @desc    Create a new moderator
// @route   POST /api/moderators
// @access  Private/Admin
const createModerator = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address, voterIdNumber, voterIdPhotoUrl } = req.body;

    const moderatorExists = await Moderator.findOne({ email: email.toLowerCase() });

    if (moderatorExists) {
        res.status(400);
        throw new Error('Moderator with this email already exists');
    }

    // In a real app, password should be hashed here.
    const moderator = await Moderator.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        address,
        voterIdNumber,
        voterIdPhotoUrl,
    });

    if (moderator) {
        res.status(201).json(moderator);
    } else {
        res.status(400);
        throw new Error('Invalid moderator data');
    }
});

// @desc    Update a moderator
// @route   PUT /api/moderators/:id
// @access  Private/Admin
const updateModerator = asyncHandler(async (req, res) => {
    const moderator = await Moderator.findById(req.params.id);

    if (moderator) {
        moderator.name = req.body.name || moderator.name;
        if (req.body.email) {
            moderator.email = req.body.email.toLowerCase();
        }
        moderator.phone = req.body.phone || moderator.phone;
        moderator.address = req.body.address || moderator.address;
        moderator.voterIdNumber = req.body.voterIdNumber || moderator.voterIdNumber;
        moderator.voterIdPhotoUrl = req.body.voterIdPhotoUrl || moderator.voterIdPhotoUrl;

        if (req.body.password) {
            // In a real app, hash the password
            moderator.password = req.body.password;
        }

        const updatedModerator = await moderator.save();
        res.json(updatedModerator);
    } else {
        res.status(404);
        throw new Error('Moderator not found');
    }
});

// @desc    Delete a moderator
// @route   DELETE /api/moderators/:id
// @access  Private/Admin
const deleteModerator = asyncHandler(async (req, res) => {
    const moderator = await Moderator.findById(req.params.id);

    if (moderator) {
        await moderator.deleteOne();
        res.json({ message: 'Moderator removed' });
    } else {
        res.status(404);
        throw new Error('Moderator not found');
    }
});


export { createModerator, updateModerator, deleteModerator };