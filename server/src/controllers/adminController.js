import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalListings,
      openListings,
      pendingClaimListings,
      resolvedListings,
      closedListings,
      totalLost,
      totalFound,
      pendingClaims,
      pendingReports,
      hiddenListings,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Item.countDocuments(),
      Item.countDocuments({ status: 'open', isModeratedHidden: false }),
      Item.countDocuments({ status: 'pending_claim', isModeratedHidden: false }),
      Item.countDocuments({ status: 'resolved' }),
      Item.countDocuments({ status: 'closed' }),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Claim.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'pending' }),
      Item.countDocuments({ isModeratedHidden: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        openListings,
        pendingClaimListings,
        resolvedListings,
        closedListings,
        totalLost,
        totalFound,
        pendingClaims,
        pendingReports,
        hiddenListings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminListings = async (req, res, next) => {
  try {
    const { status, type, hidden, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (hidden !== undefined) query.isModeratedHidden = hidden === 'true';

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate('owner', 'name email studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleHideListing = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { reason = '' } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    item.isModeratedHidden = !item.isModeratedHidden;
    item.moderationReason = item.isModeratedHidden ? reason : '';
    await item.save();

    res.status(200).json({
      success: true,
      message: item.isModeratedHidden
        ? 'Listing has been hidden from public view.'
        : 'Listing has been restored to public view.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name email studentId')
      .populate({
        path: 'item',
        populate: { path: 'owner', select: 'name email' },
      })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const moderateReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes, hideItem } = req.body;

    if (!['reviewed', 'dismissed', 'action_taken'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report status. Must be reviewed, dismissed, or action_taken.',
      });
    }

    const report = await Report.findById(reportId).populate('item');
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    report.status = status;
    report.adminNotes = adminNotes ? adminNotes.trim() : '';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    // If moderator chose to hide the reported item directly
    if (hideItem && report.item && !report.item.isModeratedHidden) {
      report.item.isModeratedHidden = true;
      report.item.moderationReason = `Hidden due to content report: ${report.reason}`;
      await report.item.save();
    }

    res.status(200).json({
      success: true,
      message: `Report marked as ${status}.`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
