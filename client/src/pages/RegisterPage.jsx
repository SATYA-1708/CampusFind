import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Compass, User, Mail, Lock, Phone, IdCard, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await register({
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim(),
        phone: phone.trim(),
        password,
      });
      toast.success('Account created! Welcome to Campus Lost & Found.');
      navigate('/activity');
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-2xl border border-campus-border shadow-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-campus-navy text-teal-300 flex items-center justify-center mx-auto shadow-subtle">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-campus-navy tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-campus-muted max-w-sm mx-auto">
            Connect with your campus community to claim lost belongings and report found items.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Minimal Data Collection Explanation */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700">Minimum Data Notice:</p>
          <p className="leading-relaxed text-[11px]">
            We only collect your name, campus email, and optional phone/student ID for verifying ownership of returned items. Data is never sold or used for advertising.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Smith"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              College Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jsmith@campus.edu"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-accent/20 focus:border-campus-accent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Student ID (Optional)
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="CS-2025-010"
                className="w-full text-sm p-2.5 rounded-xl border border-campus-border focus:outline-none focus:border-campus-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full text-sm p-2.5 rounded-xl border border-campus-border focus:outline-none focus:border-campus-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Password (Min 6 Characters) <span className="text-rose-600">*</span>
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-campus-navy uppercase tracking-wider">
              Confirm Password <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {submitting ? 'Creating Account...' : 'Complete Student Registration'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-campus-muted">
            Already have a campus account?{' '}
            <Link to="/login" className="font-semibold text-campus-accent hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-campus-accent" />
        <span>Registration defaults to student status. Administrative accounts cannot be registered publicly.</span>
      </div>
    </div>
  );
}
