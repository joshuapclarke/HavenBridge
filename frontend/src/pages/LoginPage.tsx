import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrim = email.trim();
    const passwordTrim = password.trim();
    if (!emailTrim || !passwordTrim) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    localStorage.setItem('hb_auth', 'staff');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-haven-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/favicon.svg" alt="HavenBridge" className="h-14 w-14 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">HavenBridge</h1>
            <p className="text-sm text-gray-500 mt-1">Staff Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div
                className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-haven-600 text-white font-semibold py-2.5 px-4 hover:bg-haven-700 focus:outline-none focus:ring-2 focus:ring-haven-500 focus:ring-offset-2 transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            <Link to="/welcome" className="text-haven-600 hover:text-haven-700 font-medium">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
