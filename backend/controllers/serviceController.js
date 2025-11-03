import asyncHandler from 'express-async-handler';
import Service from '../models/serviceModel.js';

const createService = asyncHandler(async (req, res) => {
    const serviceData = req.body;
    const newService = await Service.create(serviceData);
    res.status(201).json(newService);
});

const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ id: req.params.id });
    if (service) {
        Object.assign(service, req.body);
        const updatedService = await service.save();
        res.json(updatedService);
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
});

const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ id: req.params.id });
    if (service) {
        await service.deleteOne();
        res.json({ message: 'Service removed' });
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
});

const createPackage = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ id: req.params.id });
    if (service) {
        service.packages.push(req.body);
        await service.save();
        res.status(201).json(service.packages[service.packages.length - 1]);
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
});

const updatePackage = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ id: req.params.serviceId });
    if (service) {
        const pkg = service.packages.id(req.params.packageId);
        if (pkg) {
            Object.assign(pkg, req.body);
            await service.save();
            res.json(pkg);
        } else {
            res.status(404).json({ message: 'Package not found' });
        }
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
});

const deletePackage = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ id: req.params.serviceId });
    if (service) {
        const pkg = service.packages.id(req.params.packageId);
        if (pkg) {
            pkg.deleteOne();
            await service.save();
            res.json({ message: 'Package removed' });
        } else {
            res.status(404).json({ message: 'Package not found' });
        }
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
});

export { createService, updateService, deleteService, createPackage, updatePackage, deletePackage };