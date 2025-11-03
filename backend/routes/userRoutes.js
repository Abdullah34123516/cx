import express from 'express';
import asyncHandler from 'express-async-handler';
import { updateCustomerProfile, toggleUserStatus } from '../controllers/userController.js';
import User from '../models/userModel.js';
import Moderator from '../models/moderatorModel.js';


const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const user = await User.findOne({ sessionToken: token });
      if (user) { req.user = user; req.userType = 'customer'; return next(); }
      
      const moderator = await Moderator.findOne({ sessionToken: token });
      if (moderator) { req.user = moderator; req.userType = 'moderator'; return next(); }

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
  if(req.user && req.userType === 'moderator') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
});


const router = express.Router();

router.route('/:id').put(protect, updateCustomerProfile);
router.route('/:id/status').put(protect, adminProtect, toggleUserStatus);


export default router;