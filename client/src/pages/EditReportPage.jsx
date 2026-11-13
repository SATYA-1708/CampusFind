import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Upload, X, AlertCircle, ArrowLeft } from 'lucide-react';

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

export default function EditReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [identifyingDetails, setIdentifyingDetails] = useState('');
  const [status, setStatus] = useState('open');

  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const res = await api.getItemById(id);
        const itm = res.data;

        if (!itm.isOwner && user?.role !== 'admin') {
          alert('You are not authorized to edit this listing.');
          navigate(`/item/${id}`);
          return;
        }

        setTitle(itm.title || '');
        setDescription(itm.description || '');
        setCategory(itm.category || CATEGORIES[0]);
        setCampusLocation(itm.campusLocation || LOCATIONS[0]);
        setLocationDetails(itm.locationDetails || '');
        if (itm.eventDate) {
          setEventDate(new Date(itm.eventDate).toISOString().split('T')[0]);
        }
        setIdentifyingDetails(itm.identifyingDetails || '');
        setStatus(itm.status || 'open');
        setExistingImageUrl(itm.imageUrl || '');
      } catch (err) {
        setError(err.message || 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must not exceed 5MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('campusLocation', campusLocation);
      formData.append('locationDetails', locationDetails.trim());
      formData.append('eventDate', eventDate);
      formData.append('identifyingDetails', identifyingDetails.trim());
      formData.append('status', status);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.updateItem(id, formData);
      toast.success('Listing updated successfully!');
      navigate(`/item/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-campus-muted">
        Loading listing details for editing...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button
        onClick={() => navigate(`/item/${id}`)}
        className="inline-flex items-center gap-1.5 text-xs text-campus-muted hover:text-campus-navy"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel and Back to Listing
      </button>

      <div className="bg-white rounded-2xl border border-campus-border shadow-card overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-campus-border">
          <h1 className="text-xl font-bold text-campus-navy">Edit Listing Details</h1>
          <p className="text-xs text-campus-muted mt-1">
            Keep information accurate to ensure the matching algorithm and claimants have correct details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Listing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white focus:outline-none focus:border-campus-accent"
            >
              <option value="open">Open (Actively searching / available)</option>
              <option value="pending_claim">Under Pending Claim</option>
              <option value="resolved">Resolved (Returned to owner)</option>
              <option value="closed">Closed (No longer active)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-campus-border focus:outline-none focus:border-campus-accent"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white"
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Campus Location
              </label>
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white"
                required
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Specific Location Details
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-campus-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Event Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-campus-border bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-campus-border"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Identifying Details
            </label>
            <textarea
              rows={2}
              value={identifyingDetails}
              onChange={(e) => setIdentifyingDetails(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-campus-border"
            />
          </div>

          {/* Photo replacement */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Photo
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="New preview"
                  className="w-24 h-24 object-cover rounded-xl border border-campus-border"
                />
              ) : existingImageUrl ? (
                <img
                  src={existingImageUrl}
                  alt="Current"
                  className="w-24 h-24 object-cover rounded-xl border border-campus-border"
                />
              ) : null}

              <label className="px-4 py-2 rounded-xl border border-campus-border hover:bg-slate-50 text-xs font-semibold text-campus-navy cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" /> Replace Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-campus-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/item/${id}`)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-campus-muted hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-campus-navy text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
