import mongoose from 'mongoose';

const moderatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In a real app, this should be hashed
    phone: { type: String, required: true },
    address: { type: String, required: true },
    voterIdNumber: { type: String, required: true },
    voterIdPhotoUrl: { type: String, required: true },
    sessionToken: { type: String },
}, {
    timestamps: true,
});

moderatorSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        // Don't send back sensitive info
        delete returnedObject.password;
        delete returnedObject.sessionToken;
    }
});


const Moderator = mongoose.model('Moderator', moderatorSchema);
export default Moderator;