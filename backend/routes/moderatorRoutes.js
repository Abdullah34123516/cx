import express from 'express';
import { createModerator, updateModerator, deleteModerator } from '../controllers/moderatorController.js';

const router = express.Router();

router.post('/', createModerator);

router.route('/:id')
    .put(updateModerator)
    .delete(deleteModerator);

export default router;