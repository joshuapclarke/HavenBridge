import { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Supporter, DonorImpact, PublicImpactSnapshot } from '../types/models';
import { ArrowDownTrayIcon, ArrowPathIcon, GiftIcon } from '@heroicons/react/24/outline';

export default function DonorPortalPage() {
  const [donor, setDonor] = useState<Supporter | null>(null);
  const [impact, setImpact] = useState<DonorImpact | null>(null);
  const [snapshots, setSnapshots] = useState<PublicImpactSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const donorId = 1;
    Promise.all([
      api.supporters.get(donorId),
      api.impact.donorImpact(donorId),
      api.impact.snapshots(),
    ])
      .then(([d, imp, snaps]) => { setDonor(d); setImpact(imp); setSnapshots(snaps); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!donor) return <div className="p-12 text-center text-gray-400">Donor not found.</div>;

  const isRecurring = donor.donations?.some(d => d.isRecurring);
  const lastDonation = donor.donations?.length
    ? donor.donations.sort((a, b) => b.donationDate.localeCompare(a.donationDate))[0]
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-haven-700 to-haven-900 rounded-3xl p-8 sm:p-10 text-white mb-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative">
          <p className="text-haven-200 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold mb-8">{donor.displayName}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Lifetime Giving', value: `$${impact?.totalGiven.toLocaleString()}` },
              { label: 'Donations', value: impact?.donationCount },
              { label: 'Last Donation', value: lastDonation?.donationDate ?? '—' },
              { label: 'Recurring', value: isRecurring ? 'Active' : 'None' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-haven-200 text-xs uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Impact Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">Your Impact</h2>
            </div>
            <div className="p-6">
              {snapshots.length > 0 ? (
                <div className="space-y-5">
                  {snapshots.map(s => (
                    <div key={s.snapshotId} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">{s.headline}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{s.summaryText}</p>
                      <p className="text-xs text-gray-400 mt-2">{s.snapshotDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No impact stories available yet.</p>
              )}

              {impact && impact.allocations.length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Programs Supported</h3>
                  <div className="space-y-2">
                    {impact.allocations.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-haven-50 rounded-xl px-4 py-3 hover:bg-haven-100/70 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.programArea}</p>
                          <p className="text-xs text-gray-500">{a.safehouseName}</p>
                        </div>
                        <span className="font-semibold text-haven-700 tabular-nums">${a.amountAllocated.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile / Settings */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Your Profile</h3>
            <div className="space-y-3.5 text-sm">
              {[
                { label: 'Email', value: donor.email },
                { label: 'Country', value: donor.country },
                { label: 'Member Since', value: donor.firstDonationDate },
                { label: 'Channel', value: donor.acquisitionChannel },
              ].map(field => (
                <div key={field.label}>
                  <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">{field.label}</span>
                  <span className="text-gray-900 mt-0.5 block">{field.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-haven-600 to-haven-700 text-white font-medium py-3.5 rounded-2xl hover:from-haven-700 hover:to-haven-800 transition-all shadow-sm hover:shadow-md">
              <GiftIcon className="h-5 w-5" />
              Donate Again
            </button>
            <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium py-3.5 rounded-2xl hover:bg-gray-50 transition-all">
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download Receipt
            </button>
            {isRecurring && (
              <button className="w-full flex items-center justify-center gap-2 border border-haven-200 text-haven-700 font-medium py-3.5 rounded-2xl hover:bg-haven-50 transition-all">
                <ArrowPathIcon className="h-5 w-5" />
                Update Monthly Gift
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Giving History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Giving History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Campaign</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {donor.donations?.map(d => (
              <tr key={d.donationId} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{d.donationDate}</td>
                <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 tabular-nums">{d.currencyCode} {d.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{d.campaignName ?? '—'}</td>
                <td className="px-6 py-4 text-sm">
                  {d.isRecurring
                    ? <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">Recurring</span>
                    : <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">One-Time</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
