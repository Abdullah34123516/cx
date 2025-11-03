import mongoose from 'mongoose';
import localizedStringSchema from './localizedStringSchema.js';

const serviceAreaSchema = new mongoose.Schema({
    name: { type: localizedStringSchema, required: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
}, {
    timestamps: true,
});

serviceAreaSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);
export default ServiceArea;