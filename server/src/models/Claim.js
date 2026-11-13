import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    explanation: {
      type: String,
      required: [true, 'Please explain why you believe this item is yours and provide identifying proof'],
      trim: true,
      minlength: [10, 'Explanation must be at least 10 characters'],
      maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
    },
    contactNote: {
      type: String,
      trim: true,
      maxlength: [300, 'Contact note cannot exceed 300 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    ownerDecisionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Decision note cannot exceed 500 characters'],
      default: '',
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ item: 1, claimant: 1 });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
