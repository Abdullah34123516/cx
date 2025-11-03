import asyncHandler from 'express-async-handler';
import ChatSession from '../models/chatSessionModel.js';

// @desc    Create a new chat session
// @route   POST /api/chats
// @access  Private (User)
const createChat = asyncHandler(async (req, res) => {
    const { customerId, customerName } = req.body;
    const session = await ChatSession.create({ customerId, customerName });
    res.status(201).json(session);
});

// @desc    Add a message to a chat session
// @route   POST /api/chats/:id/messages
// @access  Private
const addChatMessage = asyncHandler(async (req, res) => {
    const session = await ChatSession.findById(req.params.id);
    if (session) {
        const message = req.body;
        session.messages.push(message);
        await session.save();
        res.status(201).json(session.messages[session.messages.length - 1]);
    } else {
        res.status(404);
        throw new Error('Chat session not found');
    }
});

// @desc    Assign a moderator to a chat session
// @route   PUT /api/chats/:id/assign
// @access  Private (Moderator)
const assignModerator = asyncHandler(async (req, res) => {
    const { moderatorId } = req.body;
    const session = await ChatSession.findById(req.params.id);
    if (session) {
        session.moderatorId = moderatorId;
        session.status = 'active';
        await session.save();
        res.json({ message: 'Moderator assigned' });
    } else {
        res.status(404);
        throw new Error('Chat session not found');
    }
});

export { createChat, addChatMessage, assignModerator };