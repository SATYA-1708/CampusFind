import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Compass, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await login(email.trim(), password);
      toast.success('Signed in successfully!');
      navigate('/activity');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand card */}
      <div className="bg-white rounded-2xl border border-campus-border shadow-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-campus-navy text-teal-300 flex items-center justify-center mx-auto shadow-subtle">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-campus-navy tracking-tight">Sign In to Campus Portal</h1>
          <p className="text-xs text-campus-muted">
            Enter your university credentials to manage your reports and claims.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              University Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-campus-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle transition disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Fill Buttons for Testing */}
        <div className="pt-4 border-t border-campus-border space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
            Demo Accounts for Evaluation:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('maya.patel@campus.edu', 'StudentPass123!')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-campus-border text-left transition"
            >
              <div className="font-semibold text-xs text-campus-navy">Maya P.</div>
              <div className="text-[10px] text-slate-500">Student (Lost item)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('marcus.chen@campus.edu', 'StudentPass123!')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-campus-border text-left transition"
            >
              <div className="font-semibold text-xs text-campus-navy">Marcus C.</div>
              <div className="text-[10px] text-slate-500">Student (Finder)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('admin@campus.edu', 'AdminPass2026!')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition"
            >
              <div className="font-semibold text-xs text-amber-900">Admin</div>
              <div className="text-[10px] text-amber-700">Campus Staff</div>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-campus-muted">
            New to campus lost &amp; found?{' '}
            <Link to="/register" className="font-semibold text-campus-accent hover:underline">
              Create student account
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-campus-accent" />
        <span>Protected with bcrypt password encryption &amp; HTTP-only JWT cookies</span>
      </div>
    </div>
  );
}
