import { NavLink, Outlet } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/cases', label: 'Cases', icon: ClipboardDocumentListIcon },
  { to: '/donors', label: 'Donors', icon: HeartIcon },
  { to: '/admin', label: 'Admin', icon: Cog6ToothIcon },
  { to: '/donor-portal', label: 'Donor Portal', icon: UserGroupIcon },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto flex items-center h-16 px-6">
          <NavLink to="/" className="flex items-center gap-2.5 mr-10">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-haven-600 to-haven-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Haven<span className="text-haven-600">Bridge</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-haven-50 text-haven-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
