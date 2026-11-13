import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  ShieldAlert,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Users,
  Search,
  Flag,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'reports' | 'users'
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Moderation state
  const [itemToToggle, setItemToToggle] = useState(null);
  const [hideReason, setHideReason] = useState('');
  const [reportToModerate, setReportToModerate] = useState(null);
  const [moderateStatus, setModerateStatus] = useState('action_taken');
  const [adminNotes, setAdminNotes] = useState('');
  const [hideAssociatedItem, setHideAssociatedItem] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    loadAdminData();
  }, [isAuthenticated, isAdmin, activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes] = await Promise.all([api.getAdminStats()]);
      setStats(statsRes.data);

      if (activeTab === 'listings') {
        const res = await api.getAdminListings({ limit: 50 });
        setListings(res.data || []);
      } else if (activeTab === 'reports') {
        const res = await api.getAdminReports();
        setReports(res.data || []);
      } else if (activeTab === 'users') {
        const res = await api.getAdminUsers();
        setUsers(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrator records.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-campus-border text-center space-y-4 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-campus-navy">Restricted Access</h2>
        <p className="text-xs text-campus-muted">
          Administrator privileges are required to view the campus moderation dashboard.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-xl bg-campus-navy text-white text-xs font-semibold"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const handleToggleHide = async () => {
    if (!itemToToggle) return;
    try {
      const res = await api.toggleHideListing(itemToToggle._id, hideReason);
      toast.success(res.message || 'Listing visibility updated.');
      setItemToToggle(null);
      setHideReason('');
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to update listing visibility.');
    }
  };

  const handleModerateReport = async (e) => {
    e.preventDefault();
    if (!reportToModerate) return;
    try {
      const res = await api.moderateReport(reportToModerate._id, {
        status: moderateStatus,
        adminNotes,
        hideItem: hideAssociatedItem,
      });
      toast.success(res.message || 'Moderation decision saved.');
      setReportToModerate(null);
      setAdminNotes('');
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to moderate report.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
              Staff Portal
            </span>
            <span className="text-xs text-campus-muted">Campus Safety &amp; Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-campus-navy tracking-tight mt-1">
            Administrator Dashboard
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-2 rounded-xl border border-campus-border bg-white hover:bg-slate-50 text-xs font-medium text-campus-navy transition flex items-center gap-1.5 self-start sm:self-center shadow-subtle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-campus-border shadow-subtle space-y-1">
            <span className="text-xs text-campus-muted font-medium">Open Listings</span>
            <p className="text-2xl font-bold text-campus-navy">{stats.openListings}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-campus-border shadow-subtle space-y-1">
            <span className="text-xs text-campus-muted font-medium">Pending Claims</span>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingClaims}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-campus-border shadow-subtle space-y-1">
            <span className="text-xs text-campus-muted font-medium">Resolved Items</span>
            <p className="text-2xl font-bold text-emerald-600">{stats.resolvedListings}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-campus-border shadow-subtle space-y-1">
            <span className="text-xs text-campus-muted font-medium">Hidden Posts</span>
            <p className="text-2xl font-bold text-rose-600">{stats.hiddenListings}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-campus-border shadow-subtle space-y-1">
            <span className="text-xs text-campus-muted font-medium">Flagged Reports</span>
            <p className="text-2xl font-bold text-amber-700">{stats.pendingReports}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-campus-border shadow-subtle space-y-1">
            <span className="text-xs text-campus-muted font-medium">Total Students</span>
            <p className="text-2xl font-bold text-campus-navy">{stats.totalUsers}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-campus-border">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'listings'
              ? 'border-campus-navy text-campus-navy'
              : 'border-transparent text-campus-muted hover:text-campus-navy'
          }`}
        >
          All Listings Moderation
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-campus-navy text-campus-navy'
              : 'border-transparent text-campus-muted hover:text-campus-navy'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Flagged Content ({stats?.pendingReports || 0} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-campus-navy text-campus-navy'
              : 'border-transparent text-campus-muted hover:text-campus-navy'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Directory</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-campus-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-campus-muted">Loading administrator data...</p>
        </div>
      ) : activeTab === 'listings' ? (
        /* TAB 1: ALL LISTINGS */
        <div className="bg-white rounded-2xl border border-campus-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-campus-border text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Visibility</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border">
                {listings.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'lost'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/item/${item._id}`}
                        className="font-semibold text-campus-navy hover:text-campus-accent line-clamp-1 flex items-center gap-1"
                      >
                        {item.title}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                      <span className="text-[11px] text-campus-muted">{item.category}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-600">
                      <div>{item.owner?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400">{item.owner?.email}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-600">
                      {item.campusLocation}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 uppercase">
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {item.isModeratedHidden ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setItemToToggle(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          item.isModeratedHidden
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {item.isModeratedHidden ? 'Restore Listing' : 'Hide Listing'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        /* TAB 2: FLAGGED CONTENT REPORTS */
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-campus-border text-xs text-campus-muted">
              No content reports currently pending moderator review.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep._id}
                className="bg-white rounded-2xl border border-campus-border p-5 shadow-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-campus-border pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                      Flag Reason: {rep.reason.replace(/_/g, ' ')}
                    </span>
                    <Link
                      to={`/item/${rep.item?._id}`}
                      className="font-semibold text-sm text-campus-navy hover:underline inline-flex items-center gap-1"
                    >
                      Reported Item: {rep.item?.title || 'Unknown Item'}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                      rep.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : rep.status === 'action_taken'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rep.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-campus-navy">Flagged by:</strong>{' '}
                    {rep.reporter?.name} ({rep.reporter?.email}) on{' '}
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </p>
                  {rep.details && (
                    <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong>Reporter Details:</strong> {rep.details}
                    </p>
                  )}
                  {rep.adminNotes && (
                    <p className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                      <strong>Moderator Note:</strong> {rep.adminNotes} (Reviewed by{' '}
                      {rep.reviewedBy?.name || 'Staff'})
                    </p>
                  )}
                </div>

                {rep.status === 'pending' && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReportToModerate(rep)}
                      className="px-4 py-2 rounded-xl bg-campus-navy text-white text-xs font-semibold hover:bg-slate-800"
                    >
                      Review &amp; Moderate
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* TAB 3: USER DIRECTORY */
        <div className="bg-white rounded-2xl border border-campus-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-campus-border text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Campus Email</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-semibold text-campus-navy">{u.name}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4 text-slate-500">{u.studentId || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hide / Restore Listing Modal */}
      {itemToToggle && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-campus-border shadow-dropdown p-6 space-y-4">
            <h3 className="font-semibold text-base text-campus-navy">
              {itemToToggle.isModeratedHidden ? 'Restore Listing' : 'Hide Listing From Public View'}
            </h3>
            <p className="text-xs text-campus-muted">
              Item: <span className="font-semibold text-campus-navy">{itemToToggle.title}</span>
            </p>

            {!itemToToggle.isModeratedHidden && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-campus-navy">
                  Reason for Hiding (optional note)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inappropriate content, commercial ad..."
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToToggle(null)}
                className="px-4 py-2 rounded-xl text-xs text-campus-muted hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleHide}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white ${
                  itemToToggle.isModeratedHidden ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {itemToToggle.isModeratedHidden ? 'Confirm Restore' : 'Confirm Hide'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderate Report Modal */}
      {reportToModerate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleModerateReport}
            className="bg-white rounded-2xl max-w-md w-full border border-campus-border shadow-dropdown p-6 space-y-4"
          >
            <h3 className="font-semibold text-base text-campus-navy">Review Content Report</h3>
            <p className="text-xs text-campus-muted">
              Flagged Item: {reportToModerate.item?.title}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-campus-navy">Moderation Decision</label>
              <select
                value={moderateStatus}
                onChange={(e) => setModerateStatus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-white"
              >
                <option value="action_taken">Action Taken (Flag substantiated)</option>
                <option value="dismissed">Dismiss Report (No violation found)</option>
                <option value="reviewed">Reviewed (No further action needed)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-campus-navy">Staff Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Reason or notes about moderation decision..."
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hideAssociatedItem}
                onChange={(e) => setHideAssociatedItem(e.target.checked)}
                className="rounded text-campus-navy"
              />
              <span>Hide the reported item from public listing feed</span>
            </label>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportToModerate(null)}
                className="px-4 py-2 rounded-xl text-xs text-campus-muted hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-campus-navy text-white text-xs font-semibold"
              >
                Save Decision
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
