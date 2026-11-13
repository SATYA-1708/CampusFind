import express from 'express';
import {
  getItems,
  getCampusHotspots,
  getRecentRecoveries,
  getItemById,
  createItem,
  updateItem,
  closeItem,
  getMyItems,
} from '../controllers/itemController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { uploadItemImage } from '../middleware/upload.js';
import { validateItem } from '../middleware/validate.js';

const router = express.Router();

router.get('/', optionalAuth, getItems);
router.get('/hotspots', getCampusHotspots);
router.get('/recoveries', getRecentRecoveries);
router.get('/my', requireAuth, getMyItems);
router.get('/:id', optionalAuth, getItemById);
router.post('/', requireAuth, uploadItemImage.single('image'), validateItem, createItem);
router.put('/:id', requireAuth, uploadItemImage.single('image'), updateItem);
router.patch('/:id/close', requireAuth, closeItem);

export default router;
