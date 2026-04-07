import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ImpactOverview, RecentActivity, Safehouse } from '../types/models';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface UpcomingConference {
  planId: number;
  caseConferenceDate: string;
  planCategory: string;
  status: string;
  residentCode: string;
  residentId: number;
  safehouseName: string;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<ImpactOverview | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [conferences, setConferences] = useState<UpcomingConference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.impact.overview(),
      api.admin.recentActivity(),
      api.safehouses.list(),
      api.reports.upcomingConferences().catch(() => []),
    ])
      .then(([o, a, sh, conf]) => { setOverview(o); setActivity(a); setSafehouses(sh); setConferences(conf); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const quickActions = [
    { label: 'New Resident Intake', icon: UserPlusIcon, gradient: 'from-haven-600 to-haven-700', to: '/cases/new' },
    { label: 'View Caseload', icon: ClipboardDocumentListIcon, gradient: 'from-warm-500 to-warm-600', to: '/cases' },
    { label: 'Manage Donors', icon: CurrencyDollarIcon, gradient: 'from-emerald-600 to-emerald-700', to: '/donors' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Dashboard</h1>
        <p className="text-gray-500 mt-2 text-base">Command center for daily operations across all safehouses.</p>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <SummaryCard title="Active Residents" value={overview.totalResidents} icon={<UserGroupIcon className="h-7 w-7" />} />
          <SummaryCard title="Counseling Sessions" value={overview.totalSessions.toLocaleString()} icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />} accent="border-warm-500" />
          <SummaryCard title="Total Donations" value={`$${overview.totalDonations.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-7 w-7" />} accent="border-emerald-500" />
          <SummaryCard title="Active Safehouses" value={overview.activeSafehouses} icon={<BuildingOfficeIcon className="h-7 w-7" />} accent="border-violet-500" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {quickActions.map(a => (
          <Link
            key={a.label}
            to={a.to}
            className={`group bg-gradient-to-br ${a.gradient} text-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
          >
            <a.icon className="h-10 w-10 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="text-lg font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
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
          <h2 className="font-semibold text-gray-900 text-lg mb-5">Quick Navigation</h2>
          <div className="space-y-3">
            {[
              { to: '/cases', label: 'Resident Cases', bg: 'bg-haven-50 hover:bg-haven-100', text: 'text-haven-700', Icon: ClipboardDocumentListIcon },
              { to: '/cases/new', label: 'New Intake Form', bg: 'bg-warm-50 hover:bg-warm-100', text: 'text-warm-700', Icon: UserPlusIcon },
              { to: '/donors', label: 'Donor Management', bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700', Icon: CurrencyDollarIcon },
              { to: '/reports', label: 'Reports & Analytics', bg: 'bg-violet-50 hover:bg-violet-100', text: 'text-violet-700', Icon: ChatBubbleLeftRightIcon },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center justify-between w-full px-4 py-3.5 rounded-xl ${link.bg} ${link.text} font-medium text-sm transition-all`}
              >
                <div className="flex items-center gap-2.5">
                  <link.Icon className="h-4 w-4" />
                  {link.label}
                </div>
                <ArrowRightIcon className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Conferences & Safehouse Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Case Conferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-haven-600" />
            <h2 className="font-semibold text-gray-900 text-lg">Upcoming Case Conferences</h2>
          </div>
          {conferences.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No upcoming conferences scheduled.</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {conferences.map(c => (
                <Link key={c.planId} to="/cases" className="block px-6 py-4 hover:bg-haven-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{c.residentCode}</span>
                    <span className="text-xs font-semibold text-haven-600 bg-haven-50 px-2.5 py-0.5 rounded-lg">{c.caseConferenceDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{c.planCategory}</span>
                    <span className="text-xs text-gray-400">&middot;</span>
                    <span className="text-xs text-gray-500">{c.safehouseName}</span>
                    <StatusBadge level={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Per-Safehouse Resident Counts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5 text-violet-600" />
            <h2 className="font-semibold text-gray-900 text-lg">Safehouse Occupancy</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {safehouses.map(sh => {
              const pct = sh.capacityGirls > 0 ? Math.min(100, Math.round((sh.currentOccupancy / sh.capacityGirls) * 100)) : 0;
              const barColor = pct >= 95 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-haven-500';
              return (
                <div key={sh.safehouseId} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{sh.name}</span>
                    <span className="text-xs text-gray-500 tabular-nums">{sh.currentOccupancy} / {sh.capacityGirls}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
            {safehouses.length === 0 && (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No safehouse data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
