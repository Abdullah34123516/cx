import express from 'express';
import asyncHandler from 'express-async-handler';
import { getPlatformData, createVendorApplication, approveApplication, rejectApplication, getLandingPageData } from '../controllers/platformController.js';

import User from '../models/userModel.js';
import Vendor from '../models/vendorModel.js';
import Moderator from '../models/moderatorModel.js';
import VendorApplication from '../models/vendorApplicationModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const user = await User.findOne({ sessionToken: token }).select('-sessionToken');
      if (user) { req.user = user; req.userType = 'customer'; return next(); }

      const vendor = await Vendor.findOne({ sessionToken: token }).select('-sessionToken');
      if (vendor) { req.user = vendor; req.userType = 'vendor'; return next(); }
      
      const moderator = await Moderator.findOne({ sessionToken: token }).select('-sessionToken');
      if (moderator) { req.user = moderator; req.userType = 'moderator'; return next(); }

      const application = await VendorApplication.findOne({ sessionToken: token });
      if (application) { req.user = application; req.userType = 'pending_vendor'; return next(); }

      res.status(401);
      throw new Error('Not authorized, token failed');
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const adminProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const moderator = await Moderator.findOne({ sessionToken: token });
      if (moderator) {
          req.user = moderator;
          req.userType = 'moderator';
          return next();
      }
  }
  res.status(401);
  throw new Error('Not authorized as an admin');
});


const router = express.Router();

router.get('/landing-data', getLandingPageData);
router.get('/data', protect, getPlatformData);

router.post('/vendor-applications', createVendorApplication);
router.put('/vendor-applications/:id/approve', adminProtect, approveApplication);
router.put('/vendor-applications/:id/reject', adminProtect, rejectApplication);


export default router;