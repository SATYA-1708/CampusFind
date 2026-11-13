import express from 'express';
import { submitReport } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateReport } from '../middleware/validate.js';

const router = express.Router();

router.post('/item/:itemId', requireAuth, validateReport, submitReport);

export default router;
