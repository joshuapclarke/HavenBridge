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
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to HavenBridge</h1>
        <p className="text-gray-500 mt-1">Overview of operations and impact across all safehouses.</p>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <SummaryCard title="Active Residents" value={overview.totalResidents} icon={<UserGroupIcon className="h-7 w-7" />} />
          <SummaryCard title="Counseling Sessions" value={overview.totalSessions} icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />} accent="border-warm-500" />
          <SummaryCard title="Total Donations" value={`$${overview.totalDonations.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-7 w-7" />} accent="border-emerald-500" />
          <SummaryCard title="Active Safehouses" value={overview.activeSafehouses} icon={<BuildingOfficeIcon className="h-7 w-7" />} accent="border-violet-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.map((item, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4">
                <span className={`shrink-0 h-2.5 w-2.5 rounded-full ${
                  item.type === 'Session' ? 'bg-haven-500' :
                  item.type === 'Home Visit' ? 'bg-warm-500' : 'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.description}</p>
                  <p className="text-xs text-gray-500">{item.type} &middot; {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/cases" className="block w-full text-left px-4 py-3 rounded-lg bg-haven-50 text-haven-700 font-medium text-sm hover:bg-haven-100 transition-colors">
              View Resident Cases
            </Link>
            <Link to="/donors" className="block w-full text-left px-4 py-3 rounded-lg bg-warm-50 text-warm-700 font-medium text-sm hover:bg-warm-100 transition-colors">
              Manage Donors
            </Link>
            <Link to="/admin" className="block w-full text-left px-4 py-3 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors">
              Admin Portal
            </Link>
            <Link to="/donor-portal" className="block w-full text-left px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition-colors">
              Donor Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
