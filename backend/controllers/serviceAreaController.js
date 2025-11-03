import asyncHandler from 'express-async-handler';
import ServiceArea from '../models/serviceAreaModel.js';

// @desc    Create a new service area
// @route   POST /api/service-areas
// @access  Private/Admin
const createServiceArea = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.en || !name.bn) {
        res.status(400);
        throw new Error('Name (EN and BN) is required');
    }
    const area = new ServiceArea({ name });
    const createdArea = await area.save();
    res.status(201).json(createdArea);
});

// @desc    Update a service area
// @route   PUT /api/service-areas/:id
// @access  Private/Admin
const updateServiceArea = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const area = await ServiceArea.findById(req.params.id);

    if (area) {
        area.name = name || area.name;
        const updatedArea = await area.save();
        res.json(updatedArea);
    } else {
        res.status(404);
        throw new Error('Service area not found');
    }
});

// @desc    Toggle status of a service area
// @route   PUT /api/service-areas/:id/toggle-status
// @access  Private/Admin
const toggleServiceAreaStatus = asyncHandler(async (req, res) => {
    const area = await ServiceArea.findById(req.params.id);

    if (area) {
        area.status = area.status === 'Active' ? 'Inactive' : 'Active';
        const updatedArea = await area.save();
        res.json(updatedArea);
    } else {
        res.status(404);
        throw new Error('Service area not found');
    }
});

export { createServiceArea, updateServiceArea, toggleServiceAreaStatus };