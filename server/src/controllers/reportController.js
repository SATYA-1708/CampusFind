import Report from '../models/Report.js';
import Item from '../models/Item.js';

export const submitReport = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { reason, details } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    // Check if user already reported this item
    const existingReport = await Report.findOne({
      item: itemId,
      reporter: req.user._id,
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: 'You have already reported this listing. Our moderators are reviewing it.',
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      item: itemId,
      reason,
      details: details ? details.trim() : '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reporting. Campus moderators will review this listing shortly.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
