import { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SummaryCard from '../components/SummaryCard';
import type { ImpactOverview } from '../types/models';
import {
  MagnifyingGlassIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface SearchResults {
  residents: { residentId: number; internalCode: string; caseControlNo: string; caseStatus: string; currentRiskLevel: string }[];
  supporters: { supporterId: number; displayName: string; email: string; status: string }[];
}

interface ManagedUser {
  userId: number;
  username: string;
  userFirstName: string | null;
  userLastName: string | null;
  roleId: number;
  role: string;
  needPasswordReset: boolean;
}

const ROLE_OPTIONS = [
  { id: 1, label: 'Admin' },
  { id: 2, label: 'Staff' },
  { id: 3, label: 'Donor' },
];

export default function AdminPortalPage() {
  const [overview, setOverview] = useState<ImpactOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState<number | null>(null);
  const [resetUpdating, setResetUpdating] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([api.impact.overview(), api.admin.users()])
      .then(([o, u]) => { setOverview(o); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await api.admin.search(searchQuery);
    setSearchResults(results);
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    const user = users.find(u => u.userId === userId);
    if (!user) return;
    const roleName = ROLE_OPTIONS.find(r => r.id === newRoleId)?.label;
    if (!confirm(`Change ${user.username}'s role to ${roleName}?`)) return;

    setRoleUpdating(userId);
    try {
      await api.admin.updateRole(userId, newRoleId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, roleId: newRoleId, role: roleName! } : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update role.');
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleTogglePasswordReset = async (userId: number, current: boolean) => {
    const user = users.find(u => u.userId === userId);
    if (!user) return;
    const action = current ? 'clear the password reset requirement for' : 'require a password reset for';
    if (!confirm(`${action} ${user.username}?`)) return;

    setResetUpdating(userId);
    try {
      await api.admin.setPasswordReset(userId, !current);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, needPasswordReset: !current } : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update password reset flag.');
    } finally {
      setResetUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2 text-base">High-level overview and system administration.</p>
      </div>

      {/* Metrics Overview */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <SummaryCard title="Active Residents" value={overview.totalResidents} icon={<UserGroupIcon className="h-7 w-7" />} />
          <SummaryCard title="Counseling Sessions" value={overview.totalSessions.toLocaleString()} icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />} accent="border-warm-500" />
          <SummaryCard title="Total Donations" value={`$${overview.totalDonations.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-7 w-7" />} accent="border-emerald-500" />
          <SummaryCard title="Active Safehouses" value={overview.activeSafehouses} icon={<BuildingOfficeIcon className="h-7 w-7" />} accent="border-violet-500" />
        </div>
      )}

      {/* Search */}
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

      {/* User Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <UsersIcon className="h-5 w-5 text-haven-600" />
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">User Management</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage roles and password resets for all system users.</p>
          </div>
        </div>

        {usersLoading ? (
          <div className="p-10"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Current Role</th>
                <th className="px-6 py-3">Change Role</th>
                <th className="px-6 py-3">Password Reset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.userId} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {[u.userFirstName, u.userLastName].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'Admin' ? 'bg-violet-100 text-violet-700' :
                      u.role === 'Staff' ? 'bg-haven-100 text-haven-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.roleId}
                      disabled={roleUpdating === u.userId}
                      onChange={e => handleRoleChange(u.userId, Number(e.target.value))}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-haven-500/30 disabled:opacity-50"
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      disabled={resetUpdating === u.userId}
                      onClick={() => handleTogglePasswordReset(u.userId, u.needPasswordReset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                        u.needPasswordReset
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {u.needPasswordReset ? 'Reset Pending' : 'Require Reset'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
