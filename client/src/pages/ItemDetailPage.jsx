import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MatchBadge from '../components/MatchBadge';
import ClaimModal from '../components/ClaimModal';
import ReportModal from '../components/ReportModal';
import ReviewClaimsModal from '../components/ReviewClaimsModal';
import ConfirmModal from '../components/ConfirmModal';
import PrintFlyerModal from '../components/PrintFlyerModal';
import MatchCompareModal from '../components/MatchCompareModal';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  Flag,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Lock,
  UserCheck,
  Share2,
  Printer,
  Scale,
} from 'lucide-react';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reviewClaimsOpen, setReviewClaimsOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [printFlyerOpen, setPrintFlyerOpen] = useState(false);
  const [compareMatch, setCompareMatch] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadItemAndMatches();
  }, [id]);

  const loadItemAndMatches = async () => {
    try {
      setLoading(true);
      setError('');

      const [itemRes, matchRes] = await Promise.all([
        api.getItemById(id),
        api.getMatchesForItem(id).catch(() => ({ data: { matches: [] } })),
      ]);

      setItem(itemRes.data);
      setMatches(matchRes?.data?.matches || []);
    } catch (err) {
      setError(err.message || 'Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseListing = async () => {
    try {
      await api.closeItem(item._id, { status: 'closed' });
      setConfirmCloseOpen(false);
      toast.success('Listing closed successfully.');
      await loadItemAndMatches();
    } catch (err) {
      toast.error(err.message || 'Failed to close listing.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Listing link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-campus-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-campus-muted">Loading listing details and match engine calculations...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-6 bg-white rounded-2xl border border-campus-border shadow-card space-y-3">
          <h2 className="text-lg font-semibold text-campus-navy">Listing Unavailable</h2>
          <p className="text-xs text-campus-muted">{error || 'Item not found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-campus-navy text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = item.isOwner;
  const isLost = item.type === 'lost';
  const hasUserClaim = Boolean(item.userClaim);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-campus-muted hover:text-campus-navy transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>

        <div className="flex items-center gap-2">
          {/* Print Notice Flyer Button */}
          <button
            type="button"
            onClick={() => setPrintFlyerOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-campus-border bg-white text-xs font-medium text-campus-navy hover:bg-slate-50 transition flex items-center gap-1.5 shadow-subtle"
            title="Generate printable notice flyer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Flyer</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg border border-campus-border bg-white text-xs font-medium text-campus-navy hover:bg-slate-50 transition flex items-center gap-1.5 shadow-subtle"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {!isOwner && isAuthenticated && (
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-campus-border bg-white text-xs font-medium text-rose-700 hover:bg-rose-50 transition flex items-center gap-1.5 shadow-subtle"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details (Left) + Match Sidebar & Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-campus-border shadow-card overflow-hidden">
            {/* Image Preview Banner */}
            {item.imageUrl ? (
              <div className="w-full h-80 sm:h-96 bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full py-12 bg-slate-50 border-b border-campus-border flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    isLost ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  <Tag className="w-8 h-8" />
                </div>
                <p className="text-xs text-campus-muted">No photo attached by reporter</p>
              </div>
            )}

            {/* Information Section */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Type and Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    isLost ? 'bg-amber-600 text-white' : 'bg-campus-accent text-white'
                  }`}
                >
                  {isLost ? 'Lost Item Report' : 'Found Item Report'}
                </span>

                <span
                  className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                    item.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'closed'
                      ? 'bg-slate-100 text-slate-700'
                      : item.status === 'pending_claim'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}
                >
                  Status: {item.status.replace('_', ' ')}
                </span>

                <span className="px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                  {item.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-campus-navy tracking-tight">
                {item.title}
              </h1>

              {/* Key Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-campus-border text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-campus-accent" /> Campus Location
                  </span>
                  <p className="font-medium text-campus-navy text-sm">{item.campusLocation}</p>
                  {item.locationDetails && (
                    <p className="text-slate-500 italic text-[11px]">{item.locationDetails}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-campus-accent" /> Date Lost / Found
                  </span>
                  <p className="font-medium text-campus-navy text-sm">
                    {new Date(item.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Reported on {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-campus-navy uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Identifying Details (if any) */}
              {item.identifyingDetails && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-1 text-xs">
                  <span className="font-semibold text-amber-900 block">
                    Identifying Features Noted:
                  </span>
                  <p className="text-amber-800 leading-relaxed">{item.identifyingDetails}</p>
                </div>
              )}

              {/* Privacy Protection Notice */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">
                    Campus Privacy Protection:
                  </span>{' '}
                  Personal emails, phone numbers, and private claim explanations are protected and never shown on public listings.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Match Suggestions (1 Col) */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-2xl border border-campus-border shadow-card p-6 space-y-4">
            <h3 className="font-semibold text-sm text-campus-navy uppercase tracking-wider">
              {isOwner ? 'Manage Your Listing' : 'Action Options'}
            </h3>

            {isOwner ? (
              /* Listing Owner Controls */
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setReviewClaimsOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-campus-navy hover:bg-slate-800 text-white text-xs font-semibold transition shadow-subtle"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Review Received Claims
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px]">
                    {item.claimsCount || 0}
                  </span>
                </button>

                <Link
                  to={`/item/${item._id}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-campus-border hover:bg-slate-50 text-campus-navy text-xs font-semibold transition"
                >
                  <Edit3 className="w-4 h-4" /> Edit Report Details
                </Link>

                {item.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => setConfirmCloseOpen(true)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition"
                  >
                    Close Listing
                  </button>
                )}
              </div>
            ) : (
              /* Student / Visitor Controls */
              <div className="space-y-3">
                {item.status === 'resolved' ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This item has been returned to its rightful owner.</span>
                  </div>
                ) : item.status === 'closed' ? (
                  <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs">
                    This report has been closed by the reporter.
                  </div>
                ) : hasUserClaim ? (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Claim Submitted ({item.userClaim.status})</span>
                    </div>
                    <p className="text-blue-700">
                      You submitted an ownership claim for this item on{' '}
                      {new Date(item.userClaim.createdAt).toLocaleDateString()}. Track updates in My Activity.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/login');
                        } else {
                          setClaimModalOpen(true);
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-campus-navy hover:bg-slate-800 text-white text-xs font-semibold transition shadow-subtle"
                    >
                      {isLost ? 'I Found This Item (Contact Owner)' : 'This Might Be Mine (Claim Item)'}
                    </button>

                    <p className="text-[11px] text-campus-muted leading-relaxed text-center">
                      {isLost
                        ? 'If you found this item on campus, click to notify the student with verifying details.'
                        : 'You will be prompted to provide private details that prove you are the rightful owner.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Possible Matches Section */}
          <div className="bg-white rounded-2xl border border-campus-border shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-campus-navy">
                <Sparkles className="w-4 h-4 text-campus-accent" />
                <span>Deterministic Matches ({matches.length})</span>
              </div>
              <span className="text-[11px] text-campus-muted">
                Opposite: {isLost ? 'Found' : 'Lost'}
              </span>
            </div>

            <p className="text-xs text-campus-muted leading-relaxed">
              Our automated engine cross-references category, geographic campus zone, event dates, and keyword overlap.
            </p>

            {matches.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-campus-muted">
                No active matching {isLost ? 'found' : 'lost'} items meet the similarity threshold at this time.
              </div>
            ) : (
              <div className="space-y-3.5">
                {matches.map((m) => {
                  const matchItem = m.item;
                  const score = m.score;
                  const reasons = m.reasons;
                  return (
                    <div
                      key={matchItem._id}
                      className="p-3.5 rounded-xl border border-campus-border hover:border-campus-accent/50 bg-slate-50/50 space-y-2 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/item/${matchItem._id}`}
                          className="font-semibold text-xs text-campus-navy hover:text-campus-accent line-clamp-1"
                        >
                          {matchItem.title}
                        </Link>
                        <span className="text-xs font-bold text-campus-accent shrink-0">
                          {score}%
                        </span>
                      </div>

                      <div className="text-[11px] text-campus-muted flex items-center justify-between">
                        <span>{matchItem.campusLocation}</span>
                        <span>{new Date(matchItem.eventDate).toLocaleDateString()}</span>
                      </div>

                      {reasons && reasons.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-0.5">
                          {reasons.slice(0, 2).map((r, i) => (
                            <div key={i} className="flex items-center gap-1 truncate">
                              <span className="w-1 h-1 rounded-full bg-campus-accent"></span>
                              <span className="truncate">{r}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-1 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setCompareMatch(m)}
                          className="text-[11px] font-semibold text-campus-accent hover:underline flex items-center gap-1"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Compare Side-by-Side</span>
                        </button>

                        <Link
                          to={`/item/${matchItem._id}`}
                          className="text-[11px] font-semibold text-campus-navy hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={loadItemAndMatches}
      />

      <ReportModal
        item={item}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <ReviewClaimsModal
        item={item}
        isOpen={reviewClaimsOpen}
        onClose={() => setReviewClaimsOpen(false)}
        onClaimDecided={loadItemAndMatches}
      />

      <ConfirmModal
        isOpen={confirmCloseOpen}
        title="Close Listing?"
        message="Are you sure you want to close this listing? Other students will no longer be able to submit claims."
        confirmText="Yes, Close Listing"
        onConfirm={handleCloseListing}
        onCancel={() => setConfirmCloseOpen(false)}
      />

      {/* Printable Flyer Modal */}
      <PrintFlyerModal
        item={item}
        isOpen={printFlyerOpen}
        onClose={() => setPrintFlyerOpen(false)}
      />

      {/* Side-by-Side Match Inspector Modal */}
      {compareMatch && (
        <MatchCompareModal
          sourceItem={item}
          matchedItem={compareMatch.item}
          score={compareMatch.score}
          reasons={compareMatch.reasons}
          isOpen={Boolean(compareMatch)}
          onClose={() => setCompareMatch(null)}
          onClaim={(candidate) => {
            navigate(`/item/${candidate._id}`);
          }}
        />
      )}
    </div>
  );
}
