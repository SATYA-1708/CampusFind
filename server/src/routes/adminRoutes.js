import express from 'express';
import {
  getStats,
  getAdminListings,
  toggleHideListing,
  getAdminReports,
  moderateReport,
  getAdminUsers,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/listings', getAdminListings);
router.patch('/listings/:itemId/hide', toggleHideListing);
router.get('/reports', getAdminReports);
router.patch('/reports/:reportId', moderateReport);
router.get('/users', getAdminUsers);

export default router;
