import mongoose from 'mongoose';
import localizedStringSchema from './localizedStringSchema.js';

const servicePackageSchema = new mongoose.Schema({
    name: { type: localizedStringSchema, required: true },
    price_range: { type: localizedStringSchema, required: true },
    base_price: { type: Number, required: true },
    duration: { type: localizedStringSchema, required: true },
});

servicePackageSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


const serviceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g., 'ac', 'plumbing'
    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true },
    heroImage: { type: String, required: true },
    iconName: { type: String, required: true },
    packages: [servicePackageSchema],
    availableAreaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceArea' }],
}, {
    timestamps: true,
});

serviceSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        // This schema uses a custom string `id`, so we don't map `_id`. Just remove internals.
        delete returnedObject._id;
        delete returnedObject.__v;

        // The key fix: Mongoose does not automatically convert arrays of ObjectIds to strings
        // within a custom toJSON transform. We must do it explicitly. This ensures the
        // frontend receives an array of strings, allowing the area filter to work correctly.
        if (returnedObject.availableAreaIds) {
            returnedObject.availableAreaIds = returnedObject.availableAreaIds
                .filter(id => id) // Filter out null or undefined values
                .map(id => id.toString());
        }
    }
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;