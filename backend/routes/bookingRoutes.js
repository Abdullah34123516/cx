import express from 'express';
import {
    createBooking,
    rateBooking,
    startBookingJob,
    completeBookingJob,
    reportBookingDelay,
    cancelBooking,
    assignVendor,
    getBookingById,
    checkAvailability,
} from '../controllers/bookingController.js';

const router = express.Router();

// A simple in-memory rate limiter to prevent abuse of the public availability endpoint
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // 15 requests per minute per IP

const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, []);
    }

    const timestamps = rateLimitStore.get(ip);
    
    // Remove timestamps outside the window
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    const recentTimestamps = timestamps.filter(ts => ts > windowStart);
    rateLimitStore.set(ip, recentTimestamps);

    if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        res.status(429).json({ message: 'Too many requests, please try again later.' });
    } else {
        recentTimestamps.push(now);
        rateLimitStore.set(ip, recentTimestamps);
        next();
    }
};

router.route('/').post(createBooking);
router.route('/check-availability').post(rateLimiter, checkAvailability);

router.route('/:id').get(getBookingById);
router.route('/:id/rate').post(rateBooking);
router.route('/:id/start').put(startBookingJob);
router.route('/:id/complete').put(completeBookingJob);
router.route('/:id/delay').post(reportBookingDelay);
router.route('/:id/cancel').put(cancelBooking);
router.route('/:id/assign').put(assignVendor);

export default router;
