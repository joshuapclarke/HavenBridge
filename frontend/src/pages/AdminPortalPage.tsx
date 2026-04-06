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
    { label: 'Add New Resident', icon: UserPlusIcon, color: 'bg-haven-600 hover:bg-haven-700', textColor: 'text-white' },
    { label: 'Log Session', icon: ChatBubbleLeftEllipsisIcon, color: 'bg-warm-600 hover:bg-warm-700', textColor: 'text-white' },
    { label: 'Record Home Visit', icon: HomeModernIcon, color: 'bg-emerald-600 hover:bg-emerald-700', textColor: 'text-white' },
    { label: 'Add Donor', icon: HeartIcon, color: 'bg-violet-600 hover:bg-violet-700', textColor: 'text-white' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Admin Portal</h1>
      <p className="text-gray-500 mb-8">Quick data entry and system tools.</p>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search residents or donors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-haven-500 focus:border-haven-500"
          />
        </div>
        {searchResults && (
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            {searchResults.residents.length === 0 && searchResults.supporters.length === 0 ? (
              <p className="text-sm text-gray-400">No results found for "{searchQuery}"</p>
            ) : (
              <div className="space-y-4">
                {searchResults.residents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Residents</h4>
                    {searchResults.residents.map(r => (
                      <div key={r.residentId} className="flex items-center justify-between py-2 text-sm">
                        <span className="font-medium">{r.internalCode} — {r.caseControlNo}</span>
                        <span className="text-gray-500">{r.caseStatus} / {r.currentRiskLevel}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.supporters.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Supporters</h4>
                    {searchResults.supporters.map(s => (
                      <div key={s.supporterId} className="flex items-center justify-between py-2 text-sm">
                        <span className="font-medium">{s.displayName}</span>
                        <span className="text-gray-500">{s.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-5 mb-10">
        {actions.map(a => (
          <button
            key={a.label}
            className={`${a.color} ${a.textColor} rounded-xl p-6 flex flex-col items-center gap-3 transition-colors shadow-sm`}
          >
            <a.icon className="h-10 w-10" />
            <span className="text-lg font-semibold">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {activity.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <span className={`shrink-0 h-3 w-3 rounded-full ${
                item.type === 'Session' ? 'bg-haven-500' :
                item.type === 'Home Visit' ? 'bg-warm-500' : 'bg-emerald-500'
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
