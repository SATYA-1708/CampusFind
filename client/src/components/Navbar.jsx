import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  PlusCircle,
  Inbox,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  Search,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-campus-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-campus-navy hover:opacity-90 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-campus-navy flex items-center justify-center text-white shadow-subtle group-hover:bg-campus-accent transition-colors">
              <Compass className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight block text-campus-navy">
                Campus Lost &amp; Found
              </span>
              <span className="text-xs text-campus-muted tracking-wide uppercase font-medium">
                University Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/')
                  ? 'bg-campus-accentLight text-campus-accent'
                  : 'text-campus-muted hover:text-campus-navy hover:bg-slate-100/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                Browse
              </span>
            </Link>

            <Link
              to="/report"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/report')
                  ? 'bg-campus-accent text-white shadow-sm'
                  : 'bg-campus-navy text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Report Item
            </Link>

            {isAuthenticated && (
              <Link
                to="/activity"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/activity')
                    ? 'bg-campus-accentLight text-campus-accent'
                    : 'text-campus-muted hover:text-campus-navy hover:bg-slate-100/60'
                }`}
              >
                <Inbox className="w-4 h-4" />
                My Activity
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100/80'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-campus-border bg-slate-50/70 hover:bg-slate-100 text-sm font-medium text-campus-navy transition"
                >
                  <div className="w-7 h-7 rounded-full bg-campus-navy text-white flex items-center justify-center text-xs font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[130px] truncate">{user?.name}</span>
                  {user?.role === 'admin' && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-campus-border shadow-dropdown py-1.5 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-campus-border">
                      <p className="font-semibold text-campus-navy truncate">{user?.name}</p>
                      <p className="text-xs text-campus-muted truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/activity"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-campus-navy hover:bg-slate-50 transition"
                    >
                      <Inbox className="w-4 h-4 text-campus-muted" />
                      My Activity &amp; Claims
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-amber-800 hover:bg-amber-50 transition"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Admin Moderation
                      </Link>
                    )}

                    <div className="border-t border-campus-border my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-campus-rose hover:bg-rose-50 text-left transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-campus-navy hover:text-campus-accent transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium rounded-lg bg-campus-accent text-white hover:bg-campus-accentHover shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-campus-muted hover:text-campus-navy hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-campus-border bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-campus-navy hover:bg-slate-50"
          >
            <Search className="w-4 h-4" /> Browse Listings
          </Link>

          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-campus-accent text-white"
          >
            <PlusCircle className="w-4 h-4" /> Report an Item
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/activity"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-campus-navy hover:bg-slate-50"
              >
                <Inbox className="w-4 h-4" /> My Activity
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-800 bg-amber-50"
                >
                  <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              <div className="pt-2 border-t border-campus-border">
                <div className="px-3 py-1.5 text-xs text-campus-muted">
                  Signed in as <span className="font-semibold text-campus-navy">{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-campus-rose font-medium text-left hover:bg-rose-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-campus-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 border border-campus-border rounded-lg text-sm font-medium text-campus-navy"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 bg-campus-navy text-white rounded-lg text-sm font-medium"
              >
                Create Student Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
