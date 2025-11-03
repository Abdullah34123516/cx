import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    sender: { type: String, required: true, enum: ['customer', 'moderator'] },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
}, {
    timestamps: true,
});

chatMessageSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


const chatSessionSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Moderator' },
    status: { type: String, enum: ['pending', 'active', 'closed'], default: 'pending' },
    messages: [chatMessageSchema],
}, {
    timestamps: true,
});

chatSessionSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;