import mongoose from 'mongoose';

export const ITEM_CATEGORIES = [
  'Electronics',
  'ID & Cards',
  'Bags & Backpacks',
  'Keys',
  'Clothing & Accessories',
  'Books & Stationery',
  'Water Bottles & Tumblers',
  'Jewelry & Watches',
  'Other',
];

export const CAMPUS_LOCATIONS = [
  'Main Library',
  'Student Center',
  'Science & Engineering Complex',
  'North Campus Quad',
  'Dining Commons',
  'Athletics & Gymnasium',
  'Dormitory Hall',
  'Computer Science Lab',
  'Auditorium',
  'Campus Bus Stop',
  'Other',
];

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Item type must be either lost or found'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter a title for the item'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a clear description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select an item category'],
      enum: ITEM_CATEGORIES,
      index: true,
    },
    campusLocation: {
      type: String,
      required: [true, 'Please select a campus location'],
      enum: CAMPUS_LOCATIONS,
      index: true,
    },
    locationDetails: {
      type: String,
      trim: true,
      maxlength: [250, 'Location details cannot exceed 250 characters'],
      default: '',
    },
    eventDate: {
      type: Date,
      required: [true, 'Please specify the date this item was lost or found'],
      index: true,
    },
    identifyingDetails: {
      type: String,
      trim: true,
      maxlength: [500, 'Identifying details cannot exceed 500 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'pending_claim', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    isModeratedHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    moderationReason: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid searching and filtering
itemSchema.index({ type: 1, status: 1, isModeratedHidden: 1, createdAt: -1 });
itemSchema.index({ category: 1, campusLocation: 1 });
itemSchema.index({ title: 'text', description: 'text', locationDetails: 'text' });

const Item = mongoose.model('Item', itemSchema);
export default Item;
