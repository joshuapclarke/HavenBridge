import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { clearToken, getUserRole, getUserName, hasRole } from '../services/auth';
import { useTheme } from '../hooks/useTheme';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  minRole: string;
}

const allNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, minRole: 'Staff' },
  { to: '/cases', label: 'Cases', icon: ClipboardDocumentListIcon, minRole: 'Staff' },
  { to: '/donors', label: 'Donors', icon: HeartIcon, minRole: 'Staff' },
  { to: '/reports', label: 'Reports', icon: ChartBarSquareIcon, minRole: 'Staff' },
  { to: '/admin', label: 'Admin', icon: Cog6ToothIcon, minRole: 'Admin' },
  { to: '/donor-portal', label: 'Donor Portal', icon: UserGroupIcon, minRole: 'Donor' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const role = getUserRole();
  const username = getUserName();
  const { theme, toggleTheme } = useTheme();

  const navItems = allNavItems.filter(item => hasRole(item.minRole));

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    setOpen(false);
    clearToken();
    navigate('/welcome');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/60 dark:bg-gray-950">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-700/70 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center h-16 px-6">
          <NavLink
            to="/welcome"
            className="flex items-center gap-2.5 mr-4 lg:mr-10 shrink-0"
          >
            <img src="/favicon.svg" alt="HavenBridge" className="h-9 w-9" />
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Haven<span className="text-haven-600 dark:text-haven-400">Bridge</span>
            </span>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-haven-50 text-haven-700 dark:bg-haven-950 dark:text-haven-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex ml-auto items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {username}
              {role ? ` (${role})` : ''}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              Sign Out
            </button>
          </div>

          <button
            type="button"
            className="lg:hidden ml-auto p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-haven-50 text-haven-700 dark:bg-haven-950 dark:text-haven-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
              <span className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                {username}
                {role ? ` (${role})` : ''}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {theme === 'dark' ? <SunIcon className="h-5 w-5 shrink-0" /> : <MoonIcon className="h-5 w-5 shrink-0" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-6">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-5 w-5" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">HavenBridge</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Privacy Policy</Link>
            <Link to="/impact" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Our Impact</Link>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} HavenBridge</p>
        </div>
      </footer>
    </div>
  );
}
