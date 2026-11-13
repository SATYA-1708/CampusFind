import Item from '../models/Item.js';
import { rankMatches } from '../services/matchService.js';

export const getMatchesForItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const sourceItem = await Item.findById(itemId);

    if (!sourceItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    if (sourceItem.isModeratedHidden) {
      return res.status(400).json({
        success: false,
        message: 'Matches are not calculated for hidden or moderated items.',
      });
    }

    // Look for opposite type that is active and not hidden
    const oppositeType = sourceItem.type === 'lost' ? 'found' : 'lost';

    const candidates = await Item.find({
      type: oppositeType,
      status: { $in: ['open', 'pending_claim'] },
      isModeratedHidden: false,
      owner: { $ne: sourceItem.owner },
    })
      .populate('owner', 'name')
      .lean();

    const matches = rankMatches(sourceItem, candidates, 25);

    res.status(200).json({
      success: true,
      data: {
        sourceItem: {
          id: sourceItem._id,
          title: sourceItem.title,
          type: sourceItem.type,
          category: sourceItem.category,
          campusLocation: sourceItem.campusLocation,
          eventDate: sourceItem.eventDate,
        },
        matchesCount: matches.length,
        matches,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMatches = async (req, res, next) => {
  try {
    // Find all active items owned by current user
    const myItems = await Item.find({
      owner: req.user._id,
      status: { $in: ['open', 'pending_claim'] },
      isModeratedHidden: false,
    }).lean();

    if (myItems.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Find all active items not owned by current user
    const candidateItems = await Item.find({
      owner: { $ne: req.user._id },
      status: { $in: ['open', 'pending_claim'] },
      isModeratedHidden: false,
    })
      .populate('owner', 'name')
      .lean();

    const results = [];

    for (const myItem of myItems) {
      const filteredCandidates = candidateItems.filter((c) => c.type !== myItem.type);
      const matches = rankMatches(myItem, filteredCandidates, 25);

      if (matches.length > 0) {
        results.push({
          sourceItem: myItem,
          matches,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
