import express from 'express';
import { requestOtp, verifyLogin, signupUser, loginModerator, checkVendorDuplicates } from '../controllers/authController.js';

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-login', verifyLogin);
router.post('/signup', signupUser);
router.post('/moderator/login', loginModerator);
router.post('/check-vendor-duplicates', checkVendorDuplicates);

export default router;