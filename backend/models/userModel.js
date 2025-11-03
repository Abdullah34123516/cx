import mongoose from 'mongoose';

const customerSubscriptionSchema = new mongoose.Schema({
    planName: { type: String, required: true, enum: ['FixBD Plus Basic', 'FixBD Plus Premium'] },
    status: { type: String, required: true, enum: ['Active', 'Cancelled'] },
    nextBillingDate: { type: Date, required: true },
    discountRate: { type: Number, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    avatar: { type: String, default: '' },
    bookingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    subscription: customerSubscriptionSchema,
    status: { type: String, required: true, enum: ['Active', 'Suspended'], default: 'Active' },
    sessionToken: { type: String },
}, {
    timestamps: true,
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        // Don't send back the session token
        delete returnedObject.sessionToken;
    }
});


const User = mongoose.model('User', userSchema);
export default User;