import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ClaimModal({ item, isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [explanation, setExplanation] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!explanation.trim() || explanation.trim().length < 10) {
      setError('Please provide at least 10 characters explaining your proof of ownership.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.submitClaim(item._id, {
        explanation: explanation.trim(),
        contactNote: contactNote.trim(),
      });
      toast.success('Claim submitted to listing reporter!');
      setSuccessMessage(res.message || 'Claim submitted successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-campus-border shadow-dropdown overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-campus-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-campus-navy">Submit Ownership Claim</h3>
            <p className="text-xs text-campus-muted truncate max-w-sm">For: {item.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {successMessage ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-campus-navy">Claim Submitted!</h4>
            <p className="text-sm text-campus-muted leading-relaxed">
              Your explanation and proof have been securely forwarded to the listing reporter. You will be notified in your Activity dashboard once reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Privacy notice banner */}
            <div className="p-3 rounded-xl bg-campus-accentLight border border-campus-accent/20 text-xs text-campus-navy flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-campus-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Private Verification Proof</p>
                <p className="text-campus-muted mt-0.5 leading-relaxed">
                  Your explanation is kept private and will only be shown to the finder and campus administrators to verify legitimate ownership.
                </p>
              </div>
            </div>

            {/* Explanation Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Identifying Proof / Description <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Describe details not visible in photos (e.g. lock screen wallpaper, stickers, engraved initials, serial numbers, exact pocket contents)..."
                className="w-full text-sm p-3 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
                required
              />
              <span className="text-[11px] text-campus-muted">
                Minimum 10 characters. Be specific so the finder can verify with certainty.
              </span>
            </div>

            {/* Contact Preference Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Meeting Preference / Contact Note (Optional)
              </label>
              <input
                type="text"
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                placeholder="e.g. Free between 2-4pm at Student Union Starbucks"
                className="w-full text-sm p-3 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-campus-border flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-campus-muted hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-campus-navy hover:bg-slate-800 text-white transition disabled:opacity-50"
              >
                {submitting ? 'Submitting Claim...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
