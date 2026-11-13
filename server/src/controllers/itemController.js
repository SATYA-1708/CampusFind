import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      campusLocation,
      startDate,
      endDate,
      status,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      isModeratedHidden: false,
    };

    if (type && ['lost', 'found'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (campusLocation) {
      query.campusLocation = campusLocation;
    }

    if (status) {
      query.status = status;
    } else {
      // Default to open and pending_claim unless explicitly requested
      query.status = { $in: ['open', 'pending_claim'] };
    }

    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) {
        query.eventDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.eventDate.$lte = end;
      }
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { campusLocation: { $regex: term, $options: 'i' } },
        { locationDetails: { $regex: term, $options: 'i' } },
      ];
    }

    // Determine sort order
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'event_desc') {
      sortObj = { eventDate: -1, createdAt: -1 };
    } else if (sort === 'event_asc') {
      sortObj = { eventDate: 1, createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate('owner', 'name')
        .sort(sortObj)
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

/**
 * Get active campus location hotspots with item counts
 */
export const getCampusHotspots = async (req, res, next) => {
  try {
    const hotspots = await Item.aggregate([
      {
        $match: {
          isModeratedHidden: false,
          status: { $in: ['open', 'pending_claim'] },
        },
      },
      {
        $group: {
          _id: '$campusLocation',
          count: { $sum: 1 },
          lostCount: {
            $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] },
          },
          foundCount: {
            $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          location: '$_id',
          count: 1,
          lostCount: 1,
          foundCount: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: hotspots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recently resolved / recovered items to display community trust
 */
export const getRecentRecoveries = async (req, res, next) => {
  try {
    const recoveries = await Item.find({
      status: 'resolved',
      isModeratedHidden: false,
    })
      .populate('owner', 'name')
      .sort({ resolvedAt: -1, updatedAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      data: recoveries,
    });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name role')
      .populate('resolvedClaim', 'status decidedAt');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    // If item is hidden by admin, only owner or admin can view
    const isOwner = req.user && item.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (item.isModeratedHidden && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'This listing has been hidden by moderators and is unavailable.',
      });
    }

    // Check if the current user has already submitted a claim on this item
    let userClaim = null;
    if (req.user && !isOwner) {
      userClaim = await Claim.findOne({
        item: item._id,
        claimant: req.user._id,
      }).select('status createdAt decidedAt');
    }

    // Number of claims submitted for this item (only revealed to owner or admin)
    let claimsCount = 0;
    if (isOwner || isAdmin) {
      claimsCount = await Claim.countDocuments({ item: item._id });
    }

    res.status(200).json({
      success: true,
      data: {
        ...item.toObject(),
        isOwner: Boolean(isOwner),
        claimsCount,
        userClaim,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      description,
      category,
      campusLocation,
      locationDetails,
      eventDate,
      identifyingDetails,
    } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = await Item.create({
      owner: req.user._id,
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      campusLocation,
      locationDetails: locationDetails ? locationDetails.trim() : '',
      eventDate: new Date(eventDate),
      identifyingDetails: identifyingDetails ? identifyingDetails.trim() : '',
      imageUrl,
      status: 'open',
    });

    const populated = await Item.findById(item._id).populate('owner', 'name');

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this listing.',
      });
    }

    const {
      title,
      description,
      category,
      campusLocation,
      locationDetails,
      eventDate,
      identifyingDetails,
      status,
    } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (campusLocation) item.campusLocation = campusLocation;
    if (locationDetails !== undefined) item.locationDetails = locationDetails.trim();
    if (eventDate) item.eventDate = new Date(eventDate);
    if (identifyingDetails !== undefined) item.identifyingDetails = identifyingDetails.trim();

    if (status && ['open', 'pending_claim', 'resolved', 'closed'].includes(status)) {
      item.status = status;
      if (status === 'resolved' && !item.resolvedAt) {
        item.resolvedAt = new Date();
      }
    }

    if (req.file) {
      // Delete previous image if exists
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.resolve(__dirname, '../../uploads', path.basename(item.imageUrl));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();

    const updated = await Item.findById(item._id).populate('owner', 'name');

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const closeItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update the status of this listing.',
      });
    }

    const { status = 'closed', resolutionNote } = req.body;
    if (!['closed', 'resolved', 'open'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status option. Must be open, closed, or resolved.',
      });
    }

    item.status = status;
    if (status === 'resolved') {
      item.resolvedAt = new Date();
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: `Listing status updated to ${status}.`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach count of received claims for each item
    const itemIds = items.map((i) => i._id);
    const claimCounts = await Claim.aggregate([
      { $match: { item: { $in: itemIds } } },
      { $group: { _id: '$item', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    claimCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const itemsWithCounts = items.map((i) => ({
      ...i,
      claimsCount: countMap[i._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: itemsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};
