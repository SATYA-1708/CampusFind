import express from 'express';
import {
  getMatchesForItem,
  getMyMatches,
} from '../controllers/matchController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/item/:itemId', optionalAuth, getMatchesForItem);
router.get('/my-matches', requireAuth, getMyMatches);

export default router;
