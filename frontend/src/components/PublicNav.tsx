import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-700/70 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/welcome" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="HavenBridge" className="h-8 w-8" />
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Haven<span className="text-haven-600 dark:text-haven-400">Bridge</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-2">
          <NavLink
            to="/impact"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-haven-50 text-haven-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            Our Impact
          </NavLink>
          <NavLink
            to="/privacy"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-haven-50 text-haven-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            Privacy
          </NavLink>
          <Link
            to="/register"
            className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-haven-700 dark:text-haven-300 border border-haven-200 dark:border-haven-700 hover:bg-haven-50 dark:hover:bg-haven-950 transition-all"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-haven-600 hover:bg-haven-700 transition-all shadow-sm"
          >
            Sign In
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </nav>

        <button
          className="sm:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4 space-y-1">
          <NavLink to="/impact" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>
            Our Impact
          </NavLink>
          <NavLink to="/privacy" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>
            Privacy Policy
          </NavLink>
          <NavLink to="/register" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-haven-700 dark:text-haven-300 hover:bg-haven-50 dark:hover:bg-haven-950" onClick={() => setOpen(false)}>
            Register
          </NavLink>
          <NavLink to="/login" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-haven-600 hover:bg-haven-700 text-center mt-2" onClick={() => setOpen(false)}>
            Sign In
          </NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all mt-2"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5 shrink-0" /> : <MoonIcon className="h-5 w-5 shrink-0" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      )}
    </header>
  );
}
