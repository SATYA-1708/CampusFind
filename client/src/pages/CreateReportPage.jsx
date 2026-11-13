import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  X,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag,
  Lock,
} from 'lucide-react';

const CATEGORIES = [
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

const LOCATIONS = [
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

export default function CreateReportPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [type, setType] = useState('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [campusLocation, setCampusLocation] = useState(LOCATIONS[0]);
  const [locationDetails, setLocationDetails] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [identifyingDetails, setIdentifyingDetails] = useState('');

  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-campus-border shadow-card text-center space-y-4">
        <h2 className="text-xl font-bold text-campus-navy">Sign In Required</h2>
        <p className="text-xs text-campus-muted">
          To maintain accountability and protect campus members, an authenticated student account is required to report items.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-2.5 rounded-xl bg-campus-navy text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds the 5MB size limit.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setError('Please provide a title of at least 3 characters.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Please provide a description of at least 5 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('campusLocation', campusLocation);
      formData.append('locationDetails', locationDetails.trim());
      formData.append('eventDate', eventDate);
      formData.append('identifyingDetails', identifyingDetails.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.createItem(formData);
      toast.success(`${type === 'lost' ? 'Lost' : 'Found'} item reported! Checking match correlations...`);
      navigate(`/item/${res.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please review your fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl border border-campus-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-campus-border space-y-2">
          <h1 className="text-2xl font-bold text-campus-navy tracking-tight">Report an Item</h1>
          <p className="text-xs sm:text-sm text-campus-muted">
            File a report for an item lost or found on university grounds. Our deterministic engine will instantly cross-reference opposing reports.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Item Type Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Are you reporting a lost or found item? <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'lost'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-subtle ring-2 ring-amber-600/20'
                    : 'border-campus-border text-campus-muted hover:border-slate-300'
                }`}
              >
                <span>I Lost Something</span>
              </button>

              <button
                type="button"
                onClick={() => setType('found')}
                className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'found'
                    ? 'border-campus-accent bg-teal-50 text-teal-900 shadow-subtle ring-2 ring-campus-accent/20'
                    : 'border-campus-border text-campus-muted hover:border-slate-300'
                }`}
              >
                <span>I Found Something</span>
              </button>
            </div>
          </div>

          {/* 2. Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Item Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Space Grey Apple AirPods Pro 2 in Dark Green Case"
              maxLength={100}
              className="w-full text-sm p-3 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
              required
            />
            <span className="text-[11px] text-campus-muted">
              Be concise and descriptive. Brand and color help matching algorithms.
            </span>
          </div>

          {/* 3. Category & Campus Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Campus Location <span className="text-rose-600">*</span>
              </label>
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
                required
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Location Details & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Specific Location Details (Optional)
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="e.g. 2nd floor silent study carrel near west windows"
                maxLength={250}
                className="w-full text-sm p-3 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
                required
              />
            </div>
          </div>

          {/* 5. Detailed Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Public Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe physical characteristics, condition, approximate time of day, and circumstances..."
              className="w-full text-sm p-3 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
              required
            />
            <span className="text-[11px] text-campus-muted">
              This description will be public. Do not include sensitive codes or personal phone numbers here.
            </span>
          </div>

          {/* 6. Identifying Details (Optional) */}
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-campus-border">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-campus-accent" />
              <label className="text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Identifying Features / Proof Marks (Optional)
              </label>
            </div>
            <textarea
              rows={2}
              value={identifyingDetails}
              onChange={(e) => setIdentifyingDetails(e.target.value)}
              placeholder="e.g. Scratch on left corner, sticker of GitHub mascot on back, engraved initials 'MP'..."
              className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
            />
            <span className="text-[11px] text-campus-muted">
              Used when verifying ownership claims.
            </span>
          </div>

          {/* 7. Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Item Photo (Optional)
            </label>

            {imagePreview ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-campus-border shadow-subtle group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow-subtle"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-campus-border hover:border-campus-accent/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-campus-navy">
                  Click or drag image to upload
                </span>
                <span className="text-[11px] text-campus-muted mt-1">
                  JPEG, PNG, or WebP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-campus-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-campus-muted hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-campus-navy hover:bg-slate-800 text-white transition disabled:opacity-50 shadow-subtle"
            >
              {submitting ? 'Publishing Report...' : 'Publish Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
