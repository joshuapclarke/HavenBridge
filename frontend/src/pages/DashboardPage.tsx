import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ImpactOverview, RecentActivity } from '../types/models';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [overview, setOverview] = useState<ImpactOverview | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.impact.overview(), api.admin.recentActivity()])
      .then(([o, a]) => { setOverview(o); setActivity(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2 text-base">Overview of operations and impact across all safehouses.</p>
      </div>

      {/* Stats cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <SummaryCard title="Active Residents" value={overview.totalResidents} icon={<UserGroupIcon className="h-7 w-7" />} />
          <SummaryCard title="Counseling Sessions" value={overview.totalSessions.toLocaleString()} icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />} accent="border-warm-500" />
          <SummaryCard title="Total Donations" value={`$${overview.totalDonations.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-7 w-7" />} accent="border-emerald-500" />
          <SummaryCard title="Active Safehouses" value={overview.activeSafehouses} icon={<BuildingOfficeIcon className="h-7 w-7" />} accent="border-violet-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-lg">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
                <span className={`shrink-0 h-2.5 w-2.5 rounded-full ring-4 ring-opacity-20 ${
                  item.type === 'Session' ? 'bg-haven-500 ring-haven-500' :
                  item.type === 'Home Visit' ? 'bg-warm-500 ring-warm-500' : 'bg-emerald-500 ring-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.type} &middot; {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/cases', label: 'View Resident Cases', bg: 'bg-haven-50 hover:bg-haven-100', text: 'text-haven-700' },
              { to: '/donors', label: 'Manage Donors', bg: 'bg-warm-50 hover:bg-warm-100', text: 'text-warm-700' },
              { to: '/admin', label: 'Admin Portal', bg: 'bg-gray-50 hover:bg-gray-100', text: 'text-gray-700' },
              { to: '/donor-portal', label: 'Donor Portal', bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center justify-between w-full px-4 py-3.5 rounded-xl ${link.bg} ${link.text} font-medium text-sm transition-all`}
              >
                {link.label}
                <ArrowRightIcon className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
