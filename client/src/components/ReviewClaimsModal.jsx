import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ReviewClaimsModal({ item, isOpen, onClose, onClaimDecided }) {
  const toast = useToast();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState({});

  useEffect(() => {
    if (isOpen && item) {
      loadClaims();
    }
  }, [isOpen, item]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getClaimsForItem(item._id);
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (claimId, status, markResolved = false) => {
    try {
      setActionLoading(claimId);
      const note = decisionNotes[claimId] || '';
      await api.respondToClaim(claimId, {
        status,
        ownerDecisionReason: note,
        markResolved,
      });
      toast.success(`Claim ${status} successfully.`);
      await loadClaims();
      onClaimDecided?.();
    } catch (err) {
      toast.error(err.message || 'Failed to process decision.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-campus-border shadow-dropdown overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-campus-border flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-campus-accent" />
              <h3 className="font-semibold text-lg text-campus-navy">Review Ownership Claims</h3>
            </div>
            <p className="text-xs text-campus-muted truncate mt-0.5">
              Item: <span className="font-medium text-campus-navy">{item.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-sm text-campus-muted">
              Loading submitted claims...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          ) : claims.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-campus-navy">No claims received yet</p>
              <p className="text-xs text-campus-muted">
                When a student submits a claim with proof of ownership, it will appear here privately.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border text-xs text-slate-600">
                Compare the claimant's private explanation with identifying details you observed. You can accept a claim to arrange return or reject false claims.
              </div>

              {claims.map((claim) => (
                <div
                  key={claim._id}
                  className="p-5 rounded-xl border border-campus-border bg-white space-y-3.5 shadow-subtle"
                >
                  {/* Claimant Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-campus-navy text-white flex items-center justify-center font-bold text-xs">
                        {claim.claimant?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-campus-navy">
                          {claim.claimant?.name || 'Student Claimant'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-campus-muted mt-0.5">
                          {claim.claimant?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {claim.claimant.email}
                            </span>
                          )}
                          {claim.claimant?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {claim.claimant.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                        claim.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'rejected'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  {/* Private Proof Explanation */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Private Proof of Ownership:
                    </span>
                    <p className="text-xs text-campus-navy whitespace-pre-wrap leading-relaxed">
                      {claim.explanation}
                    </p>
                  </div>

                  {/* Claimant Meeting Note */}
                  {claim.contactNote && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Meeting Preference: </span>
                      {claim.contactNote}
                    </div>
                  )}

                  {/* Owner Decision Metadata if decided */}
                  {claim.decidedAt && (
                    <div className="text-xs text-campus-muted pt-1 border-t border-campus-border">
                      Decided on {new Date(claim.decidedAt).toLocaleDateString()}
                      {claim.ownerDecisionReason && (
                        <span> &bull; Note: "{claim.ownerDecisionReason}"</span>
                      )}
                    </div>
                  )}

                  {/* Actions (if still pending) */}
                  {claim.status === 'pending' && (
                    <div className="pt-2 border-t border-campus-border space-y-2.5">
                      <input
                        type="text"
                        placeholder="Optional response note to claimant..."
                        value={decisionNotes[claim._id] || ''}
                        onChange={(e) =>
                          setDecisionNotes({
                            ...decisionNotes,
                            [claim._id]: e.target.value,
                          })
                        }
                        className="w-full text-xs p-2.5 rounded-lg border border-campus-border focus:outline-none focus:border-campus-accent"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={actionLoading === claim._id}
                          onClick={() => handleDecision(claim._id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                        >
                          Reject Claim
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === claim._id}
                          onClick={() => handleDecision(claim._id, 'accepted', false)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-campus-navy hover:bg-slate-800 text-white transition"
                        >
                          Accept Claim (Arrange Return)
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === claim._id}
                          onClick={() => handleDecision(claim._id, 'accepted', true)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition"
                        >
                          Accept &amp; Mark Resolved
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-campus-border bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-campus-navy bg-white border border-campus-border hover:bg-slate-100 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
