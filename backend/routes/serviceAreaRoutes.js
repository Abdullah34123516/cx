import express from 'express';
import { createServiceArea, updateServiceArea, toggleServiceAreaStatus } from '../controllers/serviceAreaController.js';

const router = express.Router();

router.route('/')
    .post(createServiceArea);

router.route('/:id')
    .put(updateServiceArea);

router.route('/:id/toggle-status')
    .put(toggleServiceAreaStatus);

export default router;