import { useEffect, useState } from 'react';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Supporter, SupporterSummary, DonorImpact } from '../types/models';
import {
  UserGroupIcon,
  UserIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

export default function DonorManagementPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [summary, setSummary] = useState<SupporterSummary | null>(null);
  const [selected, setSelected] = useState<Supporter | null>(null);
  const [impact, setImpact] = useState<DonorImpact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.supporters.list(), api.supporters.summary()])
      .then(([s, sum]) => { setSupporters(s); setSummary(sum); })
      .finally(() => setLoading(false));
  }, []);

  const selectDonor = async (s: Supporter) => {
    setSelected(s);
    const detail = await api.supporters.get(s.supporterId);
    setSelected(detail);
    const imp = await api.impact.donorImpact(s.supporterId);
    setImpact(imp);
  };

  if (loading) return <LoadingSpinner />;

  const totalGiven = (s: Supporter) =>
    s.donations?.reduce((sum, d) => sum + d.amount, 0) ?? 0;

  const lastGift = (s: Supporter) =>
    s.donations?.length ? s.donations.sort((a, b) => b.donationDate.localeCompare(a.donationDate))[0].donationDate : '—';

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Donor Management</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <SummaryCard title="Total Donors" value={summary.total} icon={<UserGroupIcon className="h-7 w-7" />} />
          <SummaryCard title="Active Donors" value={summary.active} icon={<UserIcon className="h-7 w-7" />} accent="border-emerald-500" />
          <SummaryCard title="At-Risk Donors" value={summary.atRisk} icon={<ExclamationCircleIcon className="h-7 w-7" />} accent="border-red-500" />
          <SummaryCard title="Avg Gift Size" value={`$${summary.avgGift.toLocaleString()}`} icon={<BanknotesIcon className="h-7 w-7" />} accent="border-warm-500" />
        </div>
      )}

      <div className="flex gap-6">
        {/* Donor Table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Last Gift</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Given</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supporters.map(s => (
                  <tr
                    key={s.supporterId}
                    onClick={() => selectDonor(s)}
                    className={`cursor-pointer transition-colors ${
                      selected?.supporterId === s.supporterId ? 'bg-haven-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{s.displayName}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{lastGift(s)}</td>
                    <td className="px-5 py-3.5 text-sm text-right font-medium text-gray-900">
                      ${totalGiven(s).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge level={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <aside className="w-80 shrink-0">
          {!selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-400 text-sm">
              Select a donor to view details.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-haven-100 flex items-center justify-center">
                    <span className="text-haven-700 font-bold">{selected.displayName[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selected.displayName}</h3>
                    <p className="text-xs text-gray-500">{selected.supporterType} &middot; {selected.country}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{selected.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge level={selected.status} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Channel</span><span className="text-gray-900">{selected.acquisitionChannel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">First Gift</span><span className="text-gray-900">{selected.firstDonationDate}</span></div>
                </div>
              </div>

              {/* Giving History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">Giving History</h4>
                </div>
                <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                  {selected.donations?.map(d => (
                    <div key={d.donationId} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.currencyCode} {d.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{d.donationDate} {d.campaignName && `· ${d.campaignName}`}</p>
                      </div>
                      {d.isRecurring && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recurring</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Summary */}
              {impact && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Impact Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Total Given</span><span className="font-semibold">${impact.totalGiven.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Donations</span><span className="font-semibold">{impact.donationCount}</span></div>
                  </div>
                  {impact.allocations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Allocations</p>
                      {impact.allocations.map((a, i) => (
                        <div key={i} className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{a.programArea} — {a.safehouseName}</span>
                          <span className="font-medium">${a.amountAllocated.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3">
                <button className="flex-1 bg-haven-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-haven-700 transition-colors">
                  Send Outreach
                </button>
                <button className="flex-1 border border-red-200 text-red-700 text-sm font-medium py-2.5 rounded-lg hover:bg-red-50 transition-colors">
                  Flag At-Risk
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
