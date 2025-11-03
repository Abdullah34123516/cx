import mongoose from 'mongoose';
import localizedStringSchema from './localizedStringSchema.js';

const dayWorkingHoursSchema = new mongoose.Schema({
    active: { type: Boolean, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
}, { _id: false });

const workingHoursSchema = new mongoose.Schema({
    Sunday: dayWorkingHoursSchema,
    Monday: dayWorkingHoursSchema,
    Tuesday: dayWorkingHoursSchema,
    Wednesday: dayWorkingHoursSchema,
    Thursday: dayWorkingHoursSchema,
    Friday: dayWorkingHoursSchema,
    Saturday: dayWorkingHoursSchema,
}, { _id: false });

const earningsSchema = new mongoose.Schema({
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    lastMonth: { type: Number, default: 0 },
}, { _id: false });

const vendorSubscriptionSchema = new mongoose.Schema({
    planName: { type: String, required: true, enum: ['Basic', 'Pro'] },
    commissionRate: { type: Number, required: true },
    monthlyFee: { type: Number, required: true },
}, { _id: false });

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    avatar: { type: String, required: true },
    verificationStatus: { type: String, enum: ['Verified', 'Unverified'], default: 'Unverified' },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    skills: [{ type: String, required: true }], // Service IDs
    coverageArea: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceArea' }],
    workingHours: workingHoursSchema,
    serviceHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    earnings: earningsSchema,
    applicationStatus: { type: String, enum: ['Approved', 'Pending'], required: true },
    subscription: vendorSubscriptionSchema,
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    voterIdPhotoUrl: { type: String, required: true },
    realtimeStatus: { type: String, enum: ['Available', 'Busy', 'Offline'], default: 'Offline' },
    bKashNumber: String,
    voterIdNumber: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    hasSmartphone: { type: Boolean, required: true },
    hasBikeOrCycle: { type: Boolean, required: true },
    autoAcceptJobs: { type: Boolean, default: false },
    sessionToken: { type: String },
}, {
    timestamps: true,
});

vendorSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        // Don't send back the session token
        delete returnedObject.sessionToken;
        
        // Explicitly convert ObjectId array to string array
        if (returnedObject.coverageArea) {
            returnedObject.coverageArea = returnedObject.coverageArea.map(id => id.toString());
        }
    }
});


const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;