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
    // For the scaffold, default to supporter ID 1 (simulating a logged-in donor)
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
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-haven-700 to-haven-900 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <p className="text-haven-200 text-sm font-medium mb-1">Welcome back,</p>
        <h1 className="text-3xl font-bold mb-6">{donor.displayName}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-haven-200 text-xs uppercase tracking-wide">Lifetime Giving</p>
            <p className="text-2xl font-bold mt-1">${impact?.totalGiven.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-haven-200 text-xs uppercase tracking-wide">Donations</p>
            <p className="text-2xl font-bold mt-1">{impact?.donationCount}</p>
          </div>
          <div>
            <p className="text-haven-200 text-xs uppercase tracking-wide">Last Donation</p>
            <p className="text-2xl font-bold mt-1">{lastDonation?.donationDate ?? '—'}</p>
          </div>
          <div>
            <p className="text-haven-200 text-xs uppercase tracking-wide">Recurring</p>
            <p className="text-2xl font-bold mt-1">{isRecurring ? 'Active' : 'None'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Impact Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Your Impact</h2>
            </div>
            <div className="p-6">
              {snapshots.length > 0 ? (
                <div className="space-y-5">
                  {snapshots.map(s => (
                    <div key={s.snapshotId} className="border border-gray-100 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{s.headline}</h3>
                      <p className="text-sm text-gray-600">{s.summaryText}</p>
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
                      <div key={i} className="flex items-center justify-between bg-haven-50 rounded-lg px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.programArea}</p>
                          <p className="text-xs text-gray-500">{a.safehouseName}</p>
                        </div>
                        <span className="font-semibold text-haven-700">${a.amountAllocated.toLocaleString()}</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500 block text-xs">Email</span><span className="text-gray-900">{donor.email}</span></div>
              <div><span className="text-gray-500 block text-xs">Country</span><span className="text-gray-900">{donor.country}</span></div>
              <div><span className="text-gray-500 block text-xs">Member Since</span><span className="text-gray-900">{donor.firstDonationDate}</span></div>
              <div><span className="text-gray-500 block text-xs">Channel</span><span className="text-gray-900">{donor.acquisitionChannel}</span></div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 bg-haven-600 text-white font-medium py-3 rounded-xl hover:bg-haven-700 transition-colors shadow-sm">
              <GiftIcon className="h-5 w-5" />
              Donate Again
            </button>
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download Receipt
            </button>
            {isRecurring && (
              <button className="w-full flex items-center justify-center gap-2 border border-haven-200 text-haven-700 font-medium py-3 rounded-xl hover:bg-haven-50 transition-colors">
                <ArrowPathIcon className="h-5 w-5" />
                Update Monthly Gift
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Giving History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Giving History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Campaign</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {donor.donations?.map(d => (
              <tr key={d.donationId}>
                <td className="px-6 py-3.5 text-sm text-gray-900">{d.donationDate}</td>
                <td className="px-6 py-3.5 text-sm text-right font-medium text-gray-900">{d.currencyCode} {d.amount.toLocaleString()}</td>
                <td className="px-6 py-3.5 text-sm text-gray-600">{d.campaignName ?? '—'}</td>
                <td className="px-6 py-3.5 text-sm">
                  {d.isRecurring
                    ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recurring</span>
                    : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">One-Time</span>
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
