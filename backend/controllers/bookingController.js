import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import Service from '../models/serviceModel.js';
import User from '../models/userModel.js';
import Vendor from '../models/vendorModel.js';
import mongoose from 'mongoose';

// @desc    Get a booking by its custom ID
// @route   GET /api/bookings/:id
// @access  Public (for now)
const getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('service');
    if (booking) {
        res.json(booking);
    } else {
        res.status(404);
        throw new Error('Booking not found');
    }
});


// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (for users)
const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, packageId, details, customerId } = req.body;

  const service = await Service.findOne({ id: serviceId });
  const customer = await User.findById(customerId);

  if (!service || !customer) {
    res.status(404);
    throw new Error('Service or Customer not found');
  }

  const pkg = service.packages.find(p => p.id === packageId);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }

  const grossAmount = pkg.base_price;
  const commission = 0;
  const finalPrice = customer.subscription ? grossAmount * (1 - customer.subscription.discountRate) : grossAmount;

  const booking = new Booking({
    service: service._id,
    packageName: pkg.name.en,
    date: details.date,
    timeSlot: details.timeSlot,
    address: details.address,
    serviceArea: details.serviceArea,
    phone: details.phone,
    status: 'Pending',
    grossAmount,
    commission,
    finalPrice,
    customerId,
  });

  const createdBooking = await booking.save();
  
  customer.bookingHistory.push(createdBooking._id);
  await customer.save();

  res.status(201).json(createdBooking);
});

// @desc    Rate a booking
// @route   POST /api/bookings/:id/rate
// @access  Private (for users)
const rateBooking = asyncHandler(async (req, res) => {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
        booking.rating = rating;
        booking.review = review;
        await booking.save();

        if (booking.provider) {
             const vendor = await Vendor.findOne({ name: booking.provider.name });
             if(vendor) {
                const allRatedBookings = await Booking.find({ 'provider.name': vendor.name, rating: { $exists: true, $ne: null } });
                const totalRating = allRatedBookings.reduce((acc, item) => acc + (item.rating || 0), 0);
                vendor.rating = parseFloat((totalRating / allRatedBookings.length).toFixed(2));
                await vendor.save();
             }
        }
        res.status(200).json({ message: 'Rating submitted' });
    } else {
        res.status(404);
        throw new Error('Booking not found');
    }
});

const startBookingJob = asyncHandler(async (req, res) => {
    const { beforePhotoUrls } = req.body;
    if (!beforePhotoUrls || beforePhotoUrls.length === 0) {
        res.status(400);
        throw new Error('At least one "before" photo is required to start the job');
    }
    const booking = await Booking.findById(req.params.id);
    if(booking) {
        booking.status = 'In Progress';
        booking.jobStartTime = Date.now();
        booking.beforePhotoUrls = beforePhotoUrls;
        await booking.save();
        res.json(booking);
    } else {
        res.status(404); throw new Error('Booking not found');
    }
});

const completeBookingJob = asyncHandler(async (req, res) => {
    const { afterPhotoUrls } = req.body;
    if (!afterPhotoUrls || afterPhotoUrls.length === 0) {
        res.status(400);
        throw new Error('At least one "after" photo is required to complete the job');
    }
    const booking = await Booking.findById(req.params.id);
    if(booking) {
        booking.status = 'Completed';
        booking.afterPhotoUrls = afterPhotoUrls;
        await booking.save();
        res.json(booking);
    } else {
        res.status(404); throw new Error('Booking not found');
    }
});

const reportBookingDelay = asyncHandler(async (req, res) => {
    const { reason, minutes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if(booking) {
        booking.delayReason = reason;
        booking.estimatedDelayMinutes = minutes;
        await booking.save();
        res.json(booking);
    } else {
        res.status(404); throw new Error('Booking not found');
    }
});

const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if(booking) {
        booking.status = 'Cancelled';
        await booking.save();
        res.json({ message: 'Booking cancelled' });
    } else {
        res.status(404); throw new Error('Booking not found');
    }
});

const assignVendor = asyncHandler(async (req, res) => {
    const { vendorId } = req.body;
    const booking = await Booking.findById(req.params.id);
    const vendor = await Vendor.findById(vendorId);

    if(booking && vendor) {
        booking.provider = {
            id: vendor._id,
            name: vendor.name,
            rating: vendor.rating,
            avatar: vendor.avatar,
            verificationStatus: vendor.verificationStatus,
        };
        booking.status = 'Accepted';
        booking.commission = booking.grossAmount * vendor.subscription.commissionRate;
        const updatedBooking = await booking.save();

        vendor.serviceHistory.push(booking._id);
        vendor.markModified('serviceHistory');
        await vendor.save();

        res.json(updatedBooking);
    } else {
        res.status(404); throw new Error('Booking or Vendor not found');
    }
});

// @desc    Check service availability for a guest
// @route   POST /api/bookings/check-availability
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
    const { serviceId, areaId, date, timeSlot } = req.body;

    if (!serviceId || !areaId || !date || !timeSlot) {
        res.status(400);
        throw new Error('Missing availability check parameters.');
    }

    try {
        const selectedDate = new Date(date);
        const areaObjectId = new mongoose.Types.ObjectId(areaId);

        // Find vendors with the right skill, area, and real-time status
        const potentialVendors = await Vendor.find({
            skills: serviceId,
            coverageArea: areaObjectId,
            realtimeStatus: 'Available',
            status: 'Active',
        });

        if (potentialVendors.length === 0) {
            return res.json({ available: false });
        }

        // Check for scheduling conflicts for each potential vendor
        let isAnyVendorAvailable = false;
        for (const vendor of potentialVendors) {
            const conflictingBooking = await Booking.findOne({
                'provider.id': vendor._id,
                date: {
                    $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                    $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
                },
                timeSlot: timeSlot,
                status: { $in: ['Accepted', 'In Progress'] }
            });

            if (!conflictingBooking) {
                isAnyVendorAvailable = true;
                break; // Found one, no need to check others
            }
        }

        res.json({ available: isAnyVendorAvailable });
    } catch (error) {
        console.error("Availability Check Error:", error);
        res.status(500).json({ message: 'Error checking availability.' });
    }
});


export { getBookingById, createBooking, rateBooking, startBookingJob, completeBookingJob, reportBookingDelay, cancelBooking, assignVendor, checkAvailability };