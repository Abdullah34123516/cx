import express from 'express';
import { createChat, addChatMessage, assignModerator } from '../controllers/chatController.js';

const router = express.Router();

router.route('/')
    .post(createChat);
    
router.route('/:id/messages')
    .post(addChatMessage);

router.route('/:id/assign')
    .put(assignModerator);

export default router;