import express from 'express';
import {
  submitClaim,
  getMyClaims,
  getClaimsForItem,
  respondToClaim,
} from '../controllers/claimController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateClaim } from '../middleware/validate.js';

const router = express.Router();

router.post('/item/:itemId', requireAuth, validateClaim, submitClaim);
router.get('/my-claims', requireAuth, getMyClaims);
router.get('/item/:itemId', requireAuth, getClaimsForItem);
router.patch('/:claimId/decision', requireAuth, respondToClaim);

export default router;
