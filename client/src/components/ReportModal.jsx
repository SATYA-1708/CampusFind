import React, { useState } from 'react';
import { X, Flag, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate or Offensive Content' },
  { value: 'duplicate_listing', label: 'Duplicate Listing' },
  { value: 'spam_or_fake', label: 'Spam, Advertisement, or Fake Post' },
  { value: 'privacy_violation', label: 'Privacy Violation or Personal Data' },
  { value: 'harassment', label: 'Harassment or Scams' },
  { value: 'other', label: 'Other Issue' },
];

export default function ReportModal({ item, isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [reason, setReason] = useState('inappropriate_content');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await api.submitReport(item._id, {
        reason,
        details: details.trim(),
      });
      toast.info('Listing reported to campus moderation staff.');
      setSuccessMessage(res.message || 'Listing reported to moderators.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-campus-border shadow-dropdown overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-campus-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-campus-navy">Report Listing</h3>
              <p className="text-xs text-campus-muted truncate max-w-xs">{item.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-campus-navy">Report Received</h4>
            <p className="text-xs text-campus-muted">
              Thank you for keeping our campus community safe. Our moderation team will inspect this post.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-campus-border bg-white focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what violates campus lost & found policy..."
                className="w-full text-sm p-2.5 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent transition"
              />
            </div>

            <div className="pt-2 border-t border-campus-border flex items-center justify-end gap-2">
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
