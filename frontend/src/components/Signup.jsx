import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Lock, User, Mail, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';

export const Signup = ({ onSwitchToLogin, onBackToLanding }) => {
  const { signup, authError, clearAuthError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    const trimmedUser = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUser) {
      setLocalError('Please enter a username.');
      return;
    }
    if (trimmedUser.length < 3) {
      setLocalError('Username must be at least 3 characters.');
      return;
    }
    if (!trimmedEmail) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(trimmedUser, trimmedEmail, password);
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {onBackToLanding && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-600 dark:text-[#39FF14] hover:underline focus:outline-none"
            >
              <span>← Back to overview</span>
            </button>
          </div>
        )}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-3 ${onBackToLanding ? 'cursor-pointer hover:scale-105 transition-transform' : ''
              }`}
            onClick={onBackToLanding}
          >
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Join Crawl<span className="text-emerald-600 dark:text-emerald-400">Forge</span>
          </h1>
          <p className="text-sm sm:text-md text-slate-500 dark:text-slate-400 mt-1">
            Create your account to start crawling and mapping websites
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg shadow-slate-200/50 dark:shadow-none">
          {displayError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-rose-700 dark:text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Registration Notice: </span>
                {displayError}
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  clearAuthError();
                }}
                className="text-[11px] font-semibold hover:underline text-rose-800 dark:text-rose-300 ml-1 flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={submitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full pl-9 pr-3 py-2.5 text-sm sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm sm:text-md rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm sm:text-md rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={submitting}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm sm:text-md rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm sm:text-md text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
