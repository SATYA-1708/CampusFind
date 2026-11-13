import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import ItemCard from '../components/ItemCard';
import CampusHotspots from '../components/CampusHotspots';
import RecentRecoveries from '../components/RecentRecoveries';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Filter,
  PlusCircle,
  X,
  Compass,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag,
  MapPin,
  Calendar,
  LayoutGrid,
  List,
  ArrowUpDown,
  Laptop,
  CreditCard,
  Key,
  Briefcase,
  Coffee,
  Clock,
  CheckCircle2,
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

const POPULAR_SEARCH_CHIPS = [
  'AirPods',
  'Hydro Flask',
  'Student ID',
  'Backpack',
  'Keys',
  'TI-84',
  'Calculator',
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [type, setType] = useState(searchParams.get('type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [campusLocation, setCampusLocation] = useState(searchParams.get('location') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Layout mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [type, category, campusLocation, status, startDate, endDate, sort, page]);

  const fetchItems = async (customSearch = search) => {
    try {
      setLoading(true);
      setError('');

      const res = await api.getItems({
        type: type || undefined,
        category: category || undefined,
        campusLocation: campusLocation || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: customSearch || undefined,
        sort: sort || undefined,
        page,
        limit: 12,
      });

      setItems(res.data || []);
      setPagination(res.pagination || { totalItems: 0, totalPages: 1, currentPage: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load campus items.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems(search);
  };

  const handleClearFilters = () => {
    setType('');
    setCategory('');
    setCampusLocation('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setSort('newest');
    setPage(1);
    toast.info('Filters reset to default view.');
  };

  const handleChipClick = (term) => {
    setSearch(term);
    setPage(1);
    fetchItems(term);
  };

  const hasActiveFilters = Boolean(
    type || category || campusLocation || status || startDate || endDate || search || sort !== 'newest'
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-campus-bg border-b border-campus-border pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-accentLight border border-campus-accent/20 text-campus-accent text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" /> University Student Portal
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-campus-navy">
            Lost something on campus?
          </h1>
          <p className="text-base sm:text-lg text-campus-muted max-w-2xl mx-auto font-normal">
            Search recent lost and found reports, receive automatic deterministic match suggestions, and safely submit ownership verification.
          </p>

          {/* Prominent Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto pt-2 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by keyword, item name, or location (e.g. 'AirPods', 'blue Hydro Flask', 'car keys')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-campus-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent shadow-card transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchItems('');
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-campus-navy text-white text-sm font-semibold hover:bg-slate-800 transition shadow-subtle shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs text-campus-muted">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Popular:</span>
            {POPULAR_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  search.toLowerCase() === chip.toLowerCase()
                    ? 'bg-campus-navy text-white border-campus-navy'
                    : 'bg-white hover:bg-slate-100 border-campus-border text-slate-700'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Quick CTA to Report */}
          <div className="pt-2 text-xs text-campus-muted flex items-center justify-center gap-2">
            <span>Can't find your item?</span>
            <Link
              to="/report"
              className="font-semibold text-campus-accent hover:underline inline-flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Report a lost or found item
            </Link>
          </div>
        </div>
      </section>

      {/* Main Browse Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Hotspots & Recent Recoveries widgets */}
        <CampusHotspots
          activeLocation={campusLocation}
          onSelectLocation={(loc) => {
            setCampusLocation(loc);
            setPage(1);
          }}
        />

        <RecentRecoveries />

        {/* Navigation Tabs (All, Lost, Found), Sorting, View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-campus-border pb-4">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setType('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                type === ''
                  ? 'bg-white text-campus-navy shadow-subtle'
                  : 'text-campus-muted hover:text-campus-navy'
              }`}
            >
              All Listings
            </button>
            <button
              type="button"
              onClick={() => {
                setType('lost');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                type === 'lost'
                  ? 'bg-amber-600 text-white shadow-subtle'
                  : 'text-campus-muted hover:text-campus-navy'
              }`}
            >
              Lost Belongings
            </button>
            <button
              type="button"
              onClick={() => {
                setType('found');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                type === 'found'
                  ? 'bg-campus-accent text-white shadow-subtle'
                  : 'text-campus-muted hover:text-campus-navy'
              }`}
            >
              Found Items
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="text-xs p-2 rounded-xl border border-campus-border bg-white font-medium text-campus-navy focus:outline-none focus:border-campus-accent"
              >
                <option value="newest">Most Recent Post</option>
                <option value="oldest">Oldest Post</option>
                <option value="event_desc">Incident Date (Newest first)</option>
                <option value="event_asc">Incident Date (Oldest first)</option>
              </select>
            </div>

            {/* View Mode Switcher (Grid / List) */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white shadow-subtle text-campus-navy' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white shadow-subtle text-campus-navy' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Compact list view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                filtersOpen || hasActiveFilters
                  ? 'border-campus-accent text-campus-accent bg-campus-accentLight font-semibold'
                  : 'border-campus-border text-campus-navy bg-white hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-campus-accent"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl text-xs text-campus-muted hover:text-campus-navy hover:bg-slate-100 transition flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown Tray */}
        {filtersOpen && (
          <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-campus-navy flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-campus-accent" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-white focus:outline-none focus:border-campus-accent"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-campus-navy flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-campus-accent" /> Campus Location
              </label>
              <select
                value={campusLocation}
                onChange={(e) => {
                  setCampusLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-white focus:outline-none focus:border-campus-accent"
              >
                <option value="">All Campus Locations</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-campus-navy">Listing Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-white focus:outline-none focus:border-campus-accent"
              >
                <option value="">Active (Open &amp; Pending Claim)</option>
                <option value="open">Open Only</option>
                <option value="pending_claim">Under Pending Claim</option>
                <option value="resolved">Resolved (Returned)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Date Range Start */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-campus-navy flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-campus-accent" /> From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 rounded-xl border border-campus-border bg-white focus:outline-none focus:border-campus-accent"
              />
            </div>
          </div>
        )}

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-campus-muted">
          <span>
            Showing <strong className="text-campus-navy">{items.length}</strong> of{' '}
            <strong className="text-campus-navy">{pagination.totalItems}</strong> listings
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              Filtered results
            </span>
          )}
        </div>

        {/* Item Cards Grid or List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-white rounded-xl border border-campus-border p-4 animate-pulse space-y-3"
              >
                <div className="h-40 bg-slate-100 rounded-lg"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-8 bg-slate-100 rounded mt-6"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
            <p className="font-semibold text-sm">Error Loading Listings</p>
            <p className="text-xs">{error}</p>
            <button
              onClick={() => fetchItems()}
              className="mt-2 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center rounded-2xl bg-white border border-campus-border shadow-subtle p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-campus-navy">No listings match your search</h3>
              <p className="text-xs text-campus-muted max-w-sm mx-auto">
                Try widening your search terms, removing filters, or submit a new report so others know what you are looking for.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-campus-border text-campus-navy hover:bg-slate-50 transition"
                >
                  Clear All Filters
                </button>
              )}
              <Link
                to="/report"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-campus-navy text-white hover:bg-slate-800 transition"
              >
                Report Lost or Found Item
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          /* Compact List View */
          <div className="bg-white rounded-2xl border border-campus-border shadow-card divide-y divide-campus-border overflow-hidden">
            {items.map((item) => (
              <div
                key={item._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'lost' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{item.category}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-campus-accent" /> {item.campusLocation}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.eventDate).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/item/${item._id}`}
                    className="font-bold text-sm text-campus-navy hover:text-campus-accent block line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-campus-muted line-clamp-1">{item.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
                      item.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'pending_claim'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/item/${item._id}`}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-campus-navy text-white hover:bg-slate-800 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border border-campus-border bg-white text-xs font-medium text-campus-navy hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs font-medium text-campus-muted">
              Page <strong className="text-campus-navy">{pagination.currentPage}</strong> of{' '}
              <strong className="text-campus-navy">{pagination.totalPages}</strong>
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl border border-campus-border bg-white text-xs font-medium text-campus-navy hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
