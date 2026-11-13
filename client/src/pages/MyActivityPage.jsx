import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReviewClaimsModal from '../components/ReviewClaimsModal';
import ConfirmModal from '../components/ConfirmModal';
import MatchCompareModal from '../components/MatchCompareModal';
import {
  Inbox,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Tag,
  Edit3,
  ExternalLink,
  Mail,
  Phone,
  UserCheck,
  Scale,
} from 'lucide-react';

export default function MyActivityPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'claims' | 'matches'
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matchesGroup, setMatchesGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim modal for owners
  const [selectedItemForClaims, setSelectedItemForClaims] = useState(null);

  // Close confirmation modal
  const [itemToClose, setItemToClose] = useState(null);

  // Match comparison state
  const [compareMatchData, setCompareMatchData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadActivityData();
  }, [isAuthenticated, activeTab]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'reports') {
        const res = await api.getMyItems();
        setReports(res.data || []);
      } else if (activeTab === 'claims') {
        const res = await api.getMyClaims();
        setClaims(res.data || []);
      } else if (activeTab === 'matches') {
        const res = await api.getMyMatches();
        setMatchesGroup(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load activity details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseItem = async () => {
    if (!itemToClose) return;
    try {
      await api.closeItem(itemToClose._id, { status: 'closed' });
      setItemToClose(null);
      toast.success('Listing closed successfully.');
      await loadActivityData();
    } catch (err) {
      toast.error(err.message || 'Failed to close listing.');
    }
  };

  const handleMarkResolved = async (itemId) => {
    try {
      await api.closeItem(itemId, { status: 'resolved' });
      toast.success('Listing marked as returned / resolved!');
      await loadActivityData();
    } catch (err) {
      toast.error(err.message || 'Failed to update item status.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & User Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-campus-navy tracking-tight">
            My Campus Activity
          </h1>
          <p className="text-xs sm:text-sm text-campus-muted mt-1">
            Track your lost &amp; found reports, monitor submitted claims, and review automated match suggestions.
          </p>
        </div>

        <Link
          to="/report"
          className="px-4 py-2.5 rounded-xl bg-campus-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle shrink-0 inline-flex items-center gap-1.5"
        >
          <span>Report New Item</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-campus-border">
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-campus-navy text-campus-navy'
              : 'border-transparent text-campus-muted hover:text-campus-navy'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Reports ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-campus-navy text-campus-navy'
              : 'border-transparent text-campus-muted hover:text-campus-navy'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>My Claims ({claims.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'matches'
              ? 'border-campus-navy text-campus-navy'
              : 'border-transparent text-campus-muted hover:text-campus-navy'
          }`}
        >
          <Sparkles className="w-4 h-4 text-campus-accent" />
          <span>Possible Matches</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-campus-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-campus-muted">Loading your activity records...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : activeTab === 'reports' ? (
        /* TAB 1: MY REPORTS */
        reports.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-campus-border p-8 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-campus-navy">No Reports Submitted Yet</h3>
            <p className="text-xs text-campus-muted max-w-sm mx-auto">
              You have not posted any lost or found items. Submit a report to let others on campus help you locate it.
            </p>
            <div className="pt-2">
              <Link
                to="/report"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-campus-navy text-white hover:bg-slate-800"
              >
                Report an Item Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-campus-border p-5 shadow-card hover:shadow-dropdown transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        item.type === 'lost'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {item.type}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        item.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'closed'
                          ? 'bg-slate-100 text-slate-600'
                          : item.status === 'pending_claim'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>

                    <span className="text-xs text-campus-muted">&bull;</span>
                    <span className="text-xs font-medium text-slate-600">{item.category}</span>
                  </div>

                  <Link
                    to={`/item/${item._id}`}
                    className="text-base font-semibold text-campus-navy hover:text-campus-accent block line-clamp-1"
                  >
                    {item.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-campus-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-campus-accent" /> {item.campusLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{' '}
                      {new Date(item.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Owner Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-campus-border">
                  <button
                    type="button"
                    onClick={() => setSelectedItemForClaims(item)}
                    className="px-3.5 py-2 rounded-xl bg-campus-navy hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Claims ({item.claimsCount || 0})</span>
                  </button>

                  <Link
                    to={`/item/${item._id}/edit`}
                    className="px-3 py-2 rounded-xl border border-campus-border hover:bg-slate-50 text-campus-navy text-xs font-semibold transition flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  {item.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => setItemToClose(item)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition"
                    >
                      Close
                    </button>
                  )}

                  {item.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(item._id)}
                      className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'claims' ? (
        /* TAB 2: MY CLAIMS */
        claims.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-campus-border p-8 space-y-3">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-campus-navy">No Claims Submitted</h3>
            <p className="text-xs text-campus-muted max-w-sm mx-auto">
              If you discover an item that belongs to you in the listings, click "This Might Be Mine" to submit a claim with verifying proof.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-campus-navy text-white hover:bg-slate-800"
              >
                Browse Found Listings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim._id}
                className="bg-white rounded-2xl border border-campus-border p-5 shadow-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-campus-muted block">
                      Claim submitted on {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/item/${claim.item?._id}`}
                      className="text-base font-semibold text-campus-navy hover:text-campus-accent inline-flex items-center gap-1.5"
                    >
                      {claim.item?.title || 'Claimed Item'}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider self-start sm:self-center ${
                      claim.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'rejected'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Claim: {claim.status}
                  </span>
                </div>

                {/* Explanation submitted */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-600 block">Your Submitted Proof:</span>
                  <p className="text-slate-800 leading-relaxed">{claim.explanation}</p>
                </div>

                {/* If Accepted: Owner Details */}
                {claim.status === 'accepted' && claim.item?.owner && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Claim Approved by Finder! Contact to Arrange Pickup:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-emerald-950 font-medium pt-1">
                      <span>Name: {claim.item.owner.name}</span>
                      {claim.item.owner.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {claim.item.owner.email}
                        </span>
                      )}
                      {claim.item.owner.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {claim.item.owner.phone}
                        </span>
                      )}
                    </div>

                    {claim.ownerDecisionReason && (
                      <p className="text-[11px] text-emerald-800 italic">
                        Finder's Note: "{claim.ownerDecisionReason}"
                      </p>
                    )}
                  </div>
                )}

                {claim.status === 'rejected' && claim.ownerDecisionReason && (
                  <div className="p-3 rounded-lg bg-slate-100 text-xs text-slate-600">
                    <span className="font-semibold">Reporter's Feedback: </span>
                    {claim.ownerDecisionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* TAB 3: POSSIBLE MATCHES */
        matchesGroup.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-campus-border p-8 space-y-3">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-campus-navy">No High Confidence Matches</h3>
            <p className="text-xs text-campus-muted max-w-sm mx-auto">
              The deterministic matching engine will automatically pair your open reports with candidate items as new listings are created.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matchesGroup.map(({ sourceItem, matches }) => (
              <div
                key={sourceItem._id}
                className="bg-white rounded-2xl border border-campus-border p-6 shadow-card space-y-4"
              >
                <div className="border-b border-campus-border pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-campus-accent block">
                      Matches for Your {sourceItem.type.toUpperCase()}:
                    </span>
                    <Link
                      to={`/item/${sourceItem._id}`}
                      className="font-semibold text-base text-campus-navy hover:underline"
                    >
                      {sourceItem.title}
                    </Link>
                  </div>
                  <span className="text-xs text-campus-muted">
                    {matches.length} candidate{matches.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map(({ item: matchedItem, score, reasons }) => (
                    <div
                      key={matchedItem._id}
                      className="p-4 rounded-xl border border-campus-border bg-slate-50 space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <Link
                          to={`/item/${matchedItem._id}`}
                          className="font-semibold text-sm text-campus-navy hover:text-campus-accent line-clamp-1"
                        >
                          {matchedItem.title}
                        </Link>
                        <span className="text-xs font-bold text-campus-accent px-2 py-0.5 rounded bg-white border border-campus-border">
                          {score}%
                        </span>
                      </div>

                      <div className="text-xs text-campus-muted flex items-center justify-between">
                        <span>{matchedItem.campusLocation}</span>
                        <span>{new Date(matchedItem.eventDate).toLocaleDateString()}</span>
                      </div>

                      {reasons && (
                        <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200">
                          {reasons.slice(0, 2).map((r, i) => (
                            <div key={i} className="truncate flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-campus-accent"></span>
                              <span className="truncate">{r}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCompareMatchData({
                              sourceItem,
                              matchedItem,
                              score,
                              reasons,
                            })
                          }
                          className="text-[11px] font-semibold text-campus-accent hover:underline flex items-center gap-1"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Compare Side-by-Side</span>
                        </button>

                        <Link
                          to={`/item/${matchedItem._id}`}
                          className="text-[11px] font-semibold text-campus-navy hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Review Claims Modal */}
      {selectedItemForClaims && (
        <ReviewClaimsModal
          item={selectedItemForClaims}
          isOpen={Boolean(selectedItemForClaims)}
          onClose={() => setSelectedItemForClaims(null)}
          onClaimDecided={loadActivityData}
        />
      )}

      {/* Close Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToClose)}
        title="Close Listing?"
        message="Are you sure you want to close this listing? It will no longer receive new claims."
        confirmText="Yes, Close"
        onConfirm={handleCloseItem}
        onCancel={() => setItemToClose(null)}
      />

      {/* Side-by-Side Match Modal */}
      {compareMatchData && (
        <MatchCompareModal
          sourceItem={compareMatchData.sourceItem}
          matchedItem={compareMatchData.matchedItem}
          score={compareMatchData.score}
          reasons={compareMatchData.reasons}
          isOpen={Boolean(compareMatchData)}
          onClose={() => setCompareMatchData(null)}
          onClaim={(candidate) => {
            navigate(`/item/${candidate._id}`);
          }}
        />
      )}
    </div>
  );
}
