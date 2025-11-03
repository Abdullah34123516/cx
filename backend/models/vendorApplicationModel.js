import mongoose from 'mongoose';

const vendorApplicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    avatar: { type: String, required: true },
    skills: [{ type: String, required: true }],
    coverageArea: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceArea' }],
    status: { type: String, enum: ['Pending'], default: 'Pending' },
    cvUrl: { type: String, required: true },
    voterIdPhotoUrl: { type: String, required: true },
    voterIdNumber: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    hasSmartphone: { type: Boolean, required: true },
    hasBikeOrCycle: { type: Boolean, required: true },
}, {
    timestamps: true,
});

vendorApplicationSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


const VendorApplication = mongoose.model('VendorApplication', vendorApplicationSchema);
export default VendorApplication;