import Claim from '../models/Claim.js';
import Item from '../models/Item.js';

export const submitClaim = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { explanation, contactNote } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    if (item.isModeratedHidden) {
      return res.status(400).json({
        success: false,
        message: 'This listing is not currently available for claims.',
      });
    }

    // Owner cannot claim their own item
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim for an item you reported.',
      });
    }

    // Cannot claim resolved or closed items
    if (item.status === 'resolved' || item.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: `This item is already marked as ${item.status}. No new claims can be submitted.`,
      });
    }

    // Check for existing pending or accepted claim by this claimant
    const existingClaim = await Claim.findOne({
      item: item._id,
      claimant: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active claim submitted for this item.',
      });
    }

    const claim = await Claim.create({
      item: item._id,
      claimant: req.user._id,
      explanation: explanation.trim(),
      contactNote: contactNote ? contactNote.trim() : '',
      status: 'pending',
    });

    // Optionally set item status to pending_claim if it is found
    if (item.status === 'open' && item.type === 'found') {
      item.status = 'pending_claim';
      await item.save();
    }

    res.status(201).json({
      success: true,
      message: 'Your claim and proof of ownership have been securely submitted to the listing reporter.',
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'item',
        select: 'title type category campusLocation imageUrl status owner createdAt',
        populate: {
          path: 'owner',
          select: 'name email phone',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // If claim is accepted, claimant is permitted to see owner's contact info.
    // If pending or rejected, sanitize owner contact info to prevent harvesting.
    const sanitizedClaims = claims.map((claim) => {
      if (claim.status !== 'accepted' && claim.item && claim.item.owner) {
        return {
          ...claim,
          item: {
            ...claim.item,
            owner: {
              _id: claim.item.owner._id,
              name: claim.item.owner.name,
            },
          },
        };
      }
      return claim;
    });

    res.status(200).json({
      success: true,
      data: sanitizedClaims,
    });
  } catch (error) {
    next(error);
  }
};

export const getClaimsForItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Strict access control: only the item owner or an admin can see claims and explanations
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view claims submitted for this listing.',
      });
    }

    const claims = await Claim.find({ item: itemId })
      .populate('claimant', 'name email phone studentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      item: {
        id: item._id,
        title: item.title,
        status: item.status,
      },
      data: claims,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { status, ownerDecisionReason, markResolved } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "accepted" or "rejected".',
      });
    }

    const claim = await Claim.findById(claimId).populate('item');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.',
      });
    }

    const item = claim.item;
    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to make decisions on this claim.',
      });
    }

    claim.status = status;
    claim.ownerDecisionReason = ownerDecisionReason ? ownerDecisionReason.trim() : '';
    claim.decidedAt = new Date();
    await claim.save();

    // Update item status based on decision
    if (status === 'accepted') {
      if (markResolved) {
        item.status = 'resolved';
        item.resolvedAt = new Date();
        item.resolvedClaim = claim._id;
      } else {
        item.status = 'pending_claim';
      }
      await item.save();
    } else if (status === 'rejected') {
      // Check if there are other pending claims; if none, revert to open
      const remainingPending = await Claim.countDocuments({
        item: item._id,
        status: { $in: ['pending', 'accepted'] },
      });
      if (remainingPending === 0 && item.status === 'pending_claim') {
        item.status = 'open';
        await item.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Claim successfully ${status}.`,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};
