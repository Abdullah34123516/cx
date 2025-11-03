import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    avatar: { type: String, required: true },
    verificationStatus: { type: String, required: true, enum: ['Verified', 'Unverified'] },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    packageName: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true, enum: ['morning', 'afternoon', 'evening'] },
    address: { type: String, required: true },
    serviceArea: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceArea', required: true },
    phone: { type: String, required: true },
    provider: providerSchema, // Denormalized for history
    status: { type: String, required: true, enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'] },
    rating: Number,
    review: String,
    beforePhotoUrls: [String],
    afterPhotoUrls: [String],
    grossAmount: { type: Number, required: true },
    commission: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobStartTime: Number,
    delayReason: String,
    estimatedDelayMinutes: Number,
    assignedBySystem: Boolean,
}, {
    timestamps: true,
});

bookingSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;