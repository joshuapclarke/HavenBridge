import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { saveToken } from '../services/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await api.auth.register({
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
      });
      saveToken(token);
      navigate('/donor-portal');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-haven-50 via-white to-gray-100" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-haven-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-haven-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 mb-5 rounded-2xl bg-gradient-to-br from-haven-50 to-haven-100 flex items-center justify-center shadow-sm">
              <img src="/favicon.svg" alt="HavenBridge" className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create an account</h1>
            <p className="text-sm text-gray-500 mt-1.5">Join HavenBridge as a donor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm px-4 py-3" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-first" className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <input id="reg-first" type="text" autoComplete="given-name" value={form.firstName} onChange={update('firstName')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="reg-last" className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input id="reg-last" type="text" autoComplete="family-name" value={form.lastName} onChange={update('lastName')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input id="reg-username" type="text" autoComplete="username" value={form.username} onChange={update('username')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={update('password')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input id="reg-confirm" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-haven-600 to-haven-700 text-white font-semibold py-3 px-4 hover:from-haven-700 hover:to-haven-800 focus:outline-none focus:ring-2 focus:ring-haven-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-haven-600 hover:text-haven-700 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
