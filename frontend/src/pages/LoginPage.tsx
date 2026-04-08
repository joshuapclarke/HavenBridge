import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { saveToken, parseToken } from '../services/auth';
import PublicNav from '../components/PublicNav';
import usePageTitle from '../hooks/usePageTitle';
import PublicFooter from '../components/PublicFooter';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const PW_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'One special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export default function LoginPage() {
  usePageTitle('Sign In');
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [currentPasswordForReset, setCurrentPasswordForReset] = useState('');

  const resetChecks = useMemo(() => PW_RULES.map(r => ({ ...r, pass: r.test(newPassword) })), [newPassword]);
  const resetAllPassed = resetChecks.every(c => c.pass);
  const resetStrength = resetChecks.filter(c => c.pass).length;
  const resetStrengthColor = resetStrength <= 1 ? 'bg-red-400' : resetStrength <= 3 ? 'bg-amber-400' : 'bg-emerald-500';

  const navigateByRole = () => {
    const payload = parseToken();
    if (payload?.role === 'Donor') {
      navigate('/donor-portal');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const { token, needPasswordReset } = await api.auth.login({ username: username.trim(), password });
      saveToken(token);

      if (needPasswordReset) {
        setCurrentPasswordForReset(password);
        setShowResetModal(true);
      } else {
        navigateByRole();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetAllPassed) {
      setResetError('New password does not meet all requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      await api.auth.changePassword({ currentPassword: currentPasswordForReset, newPassword });
      setShowResetModal(false);
      navigateByRole();
    } catch (err: any) {
      setResetError(err.message || 'Failed to change password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      <div className="flex-1 relative flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-haven-50 via-white to-gray-100" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-haven-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-haven-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="h-16 w-16 mb-5 rounded-2xl bg-gradient-to-br from-haven-50 to-haven-100 flex items-center justify-center shadow-sm">
                <img src="/favicon.svg" alt="HavenBridge" className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
              <p className="text-sm text-gray-500 mt-1.5">Sign in to your HavenBridge account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm px-4 py-3" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input id="login-username" type="text" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-haven-600 to-haven-700 text-white font-semibold py-3 px-4 hover:from-haven-700 hover:to-haven-800 focus:outline-none focus:ring-2 focus:ring-haven-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-haven-600 hover:text-haven-700 font-medium transition-colors">Sign up</Link>
              {' '}&middot;{' '}
              <Link to="/welcome" className="text-haven-600 hover:text-haven-700 font-medium transition-colors">Back to home</Link>
            </p>
          </div>
        </div>
      </div>

      <PublicFooter />

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 w-full max-w-md">
            <div className="flex flex-col items-center mb-6">
              <div className="h-14 w-14 mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Password Reset Required</h2>
              <p className="text-sm text-gray-500 mt-1 text-center">An administrator has requested that you change your password before continuing.</p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4" noValidate>
              {resetError && (
                <div className="rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm px-4 py-3" role="alert">
                  {resetError}
                </div>
              )}

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
                {newPassword.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                      {PW_RULES.map((_, i) => (
                        <div key={i} className={`flex-1 rounded-full transition-colors ${i < resetStrength ? resetStrengthColor : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <ul className="space-y-0.5">
                      {resetChecks.map(c => (
                        <li key={c.key} className={`flex items-center gap-1.5 text-xs ${c.pass ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {c.pass ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <XCircleIcon className="h-3.5 w-3.5" />}
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
              </div>

              <button type="submit" disabled={resetLoading}
                className="w-full rounded-xl bg-gradient-to-r from-haven-600 to-haven-700 text-white font-semibold py-3 px-4 hover:from-haven-700 hover:to-haven-800 focus:outline-none focus:ring-2 focus:ring-haven-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all disabled:opacity-60">
                {resetLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
