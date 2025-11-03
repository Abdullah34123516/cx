import express from 'express';
import { createWithdrawalRequest, approveWithdrawalRequest } from '../controllers/withdrawalController.js';

const router = express.Router();

router.route('/')
    .post(createWithdrawalRequest);

router.route('/:id/approve')
    .put(approveWithdrawalRequest);

export default router;