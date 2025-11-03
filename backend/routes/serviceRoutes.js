import express from 'express';
import {
    createService,
    updateService,
    deleteService,
    createPackage,
    updatePackage,
    deletePackage,
} from '../controllers/serviceController.js';

const router = express.Router();

router.route('/')
    .post(createService);

router.route('/:id')
    .put(updateService)
    .delete(deleteService);
    
router.route('/:id/packages')
    .post(createPackage);

router.route('/:serviceId/packages/:packageId')
    .put(updatePackage)
    .delete(deletePackage);

export default router;