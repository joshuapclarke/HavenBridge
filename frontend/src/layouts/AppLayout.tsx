import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { clearToken, getUserRole, getUserName, hasRole } from '../services/auth';

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
  const role = getUserRole();
  const username = getUserName();

  const navItems = allNavItems.filter(item => hasRole(item.minRole));

  function handleLogout() {
    clearToken();
    navigate('/welcome');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/60">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/70 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center h-16 px-6">
          <NavLink to={hasRole('Staff') ? '/dashboard' : '/donor-portal'} className="flex items-center gap-2.5 mr-10">
            <img src="/favicon.svg" alt="HavenBridge" className="h-9 w-9" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Haven<span className="text-haven-600">Bridge</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-haven-50 text-haven-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {username}{role ? ` (${role})` : ''}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
