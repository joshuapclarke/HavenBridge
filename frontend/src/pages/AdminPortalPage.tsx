import { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { RecentActivity } from '../types/models';
import {
  UserPlusIcon,
  ChatBubbleLeftEllipsisIcon,
  HomeModernIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface SearchResults {
  residents: { residentId: number; internalCode: string; caseControlNo: string; caseStatus: string; currentRiskLevel: string }[];
  supporters: { supporterId: number; displayName: string; email: string; status: string }[];
}

export default function AdminPortalPage() {
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    api.admin.recentActivity()
      .then(setActivity)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await api.admin.search(searchQuery);
    setSearchResults(results);
  };

  if (loading) return <LoadingSpinner />;

  const actions = [
    { label: 'Add New Resident', icon: UserPlusIcon, gradient: 'from-haven-600 to-haven-700' },
    { label: 'Log Session', icon: ChatBubbleLeftEllipsisIcon, gradient: 'from-warm-500 to-warm-600' },
    { label: 'Record Home Visit', icon: HomeModernIcon, gradient: 'from-emerald-600 to-emerald-700' },
    { label: 'Add Donor', icon: HeartIcon, gradient: 'from-violet-600 to-violet-700' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
        <p className="text-gray-500 mt-2 text-base">Quick data entry and system tools.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-10">
        <div className="relative max-w-xl">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search residents or donors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-haven-500/30 focus:border-haven-500 transition-all"
          />
        </div>
        {searchResults && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {searchResults.residents.length === 0 && searchResults.supporters.length === 0 ? (
              <p className="text-sm text-gray-400">No results found for "{searchQuery}"</p>
            ) : (
              <div className="space-y-5">
                {searchResults.residents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Residents</h4>
                    <div className="space-y-1">
                      {searchResults.residents.map(r => (
                        <div key={r.residentId} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          <span className="font-medium text-gray-900">{r.internalCode} — {r.caseControlNo}</span>
                          <span className="text-gray-500">{r.caseStatus} / {r.currentRiskLevel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.supporters.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Supporters</h4>
                    <div className="space-y-1">
                      {searchResults.supporters.map(s => (
                        <div key={s.supporterId} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          <span className="font-medium text-gray-900">{s.displayName}</span>
                          <span className="text-gray-500">{s.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-5 mb-12">
        {actions.map(a => (
          <button
            key={a.label}
            className={`group bg-gradient-to-br ${a.gradient} text-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
          >
            <a.icon className="h-10 w-10 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="text-lg font-semibold">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {activity.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
              <span className={`shrink-0 h-3 w-3 rounded-full ring-4 ring-opacity-20 ${
                item.type === 'Session' ? 'bg-haven-500 ring-haven-500' :
                item.type === 'Home Visit' ? 'bg-warm-500 ring-warm-500' : 'bg-emerald-500 ring-emerald-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.type} &middot; {item.date} {item.socialWorker && `· ${item.socialWorker}`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
