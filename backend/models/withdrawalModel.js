import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: 'bKash' },
    accountNumber: { type: String, required: true },
    status: { type: String, required: true, enum: ['Pending', 'Completed'], default: 'Pending' },
}, {
    timestamps: true,
});

withdrawalSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;