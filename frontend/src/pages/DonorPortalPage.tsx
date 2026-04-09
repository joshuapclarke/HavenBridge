import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getSupporterId, saveToken } from '../services/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import type { Supporter, DonorImpact, PublicImpactSnapshot } from '../types/models';
import { ArrowDownTrayIcon, ArrowPathIcon, GiftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import usePageTitle from '../hooks/usePageTitle';

const currencySymbol: Record<string, string> = { USD: '$', PHP: '₱', SGD: 'S$', CAD: 'C$' };

export default function DonorPortalPage() {
  usePageTitle('Donor Portal');
  const [donor, setDonor] = useState<Supporter | null>(null);
  const [impact, setImpact] = useState<DonorImpact | null>(null);
  const [snapshots, setSnapshots] = useState<PublicImpactSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donateForm, setDonateForm] = useState({ donationType: 'Monetary', amount: 0, campaignName: '', currencyCode: 'PHP', isRecurring: false });
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ email: '', phone: '', region: '', country: '' });

  const loadDonorData = async (supporterId: number) => {
    const [d, imp, snaps] = await Promise.all([
      api.supporters.get(supporterId),
      api.impact.donorImpact(supporterId),
      api.impact.snapshots(),
    ]);
    setDonor(d);
    setImpact(imp);
    setSnapshots(snaps);
  };

  useEffect(() => {
    const supporterId = getSupporterId();
    if (!supporterId) {
      setNoProfile(true);
      setLoading(false);
      return;
    }
    loadDonorData(supporterId)
      .catch(() => setNoProfile(true))
      .finally(() => setLoading(false));
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donor || donateForm.amount <= 0) return;

    setDonateLoading(true);
    setDonateSuccess(false);
    try {
      await api.donations.create({
        supporterId: donor.supporterId,
        donationDate: new Date().toISOString().split('T')[0],
        ...donateForm,
        channelSource: 'Donor Portal',
      });
      setDonateSuccess(true);
      await loadDonorData(donor.supporterId);
      const imp = await api.impact.donorImpact(donor.supporterId);
      setImpact(imp);
      setTimeout(() => {
        setShowDonateForm(false);
        setDonateSuccess(false);
        setDonateForm({ donationType: 'Monetary', amount: 0, campaignName: '', currencyCode: 'PHP', isRecurring: false });
      }, 1200);
    } catch {
      alert('Failed to process donation. Please try again.');
    } finally {
      setDonateLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProfile(true);
    try {
      const payload = {
        email: profileForm.email || undefined,
        phone: profileForm.phone || undefined,
        region: profileForm.region || undefined,
        country: profileForm.country || undefined,
      };
      const { token, supporterId } = await api.auth.createDonorProfile(payload);
      saveToken(token);
      setNoProfile(false);
      setLoading(true);
      await loadDonorData(supporterId);
      setLoading(false);
    } catch {
      alert('Failed to create donor profile. Please try again.');
    } finally {
      setCreatingProfile(false);
    }
  };

  if (noProfile) {
    const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all';
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
          <UserPlusIcon className="h-12 w-12 text-haven-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Set Up Your Donor Profile</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Tell us a bit about yourself so we can personalize your experience. All fields are optional.</p>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input id="profile-email" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input id="profile-phone" type="tel" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} placeholder="+1 (555) 123-4567" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="profile-region" className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
                <input id="profile-region" value={profileForm.region} onChange={e => setProfileForm(f => ({ ...f, region: e.target.value }))} className={inputClass} placeholder="e.g. Visayas" />
              </div>
              <div>
                <label htmlFor="profile-country" className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input id="profile-country" value={profileForm.country} onChange={e => setProfileForm(f => ({ ...f, country: e.target.value }))} className={inputClass} placeholder="e.g. Philippines" />
              </div>
            </div>
            <button
              type="submit"
              disabled={creatingProfile}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-haven-600 text-white font-semibold rounded-xl hover:bg-haven-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60 mt-2"
            >
              <UserPlusIcon className="h-5 w-5" />
              {creatingProfile ? 'Creating...' : 'Create My Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
              { label: 'Lifetime Giving', value: `$${impact?.totalGiven.toLocaleString() ?? 0}` },
              { label: 'Donations', value: impact?.donationCount ?? 0 },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — Giving History then Impact */}
        <div className="lg:col-span-2 space-y-6">
          {/* Giving History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">Giving History</h2>
            </div>
            {(!donor.donations || donor.donations.length === 0) ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">No donations yet. Click "Donate Again" to make your first contribution!</div>
            ) : (
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
                  {donor.donations.map(d => (
                    <tr key={d.donationId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{d.donationDate}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 tabular-nums">{currencySymbol[d.currencyCode] ?? d.currencyCode}{d.amount.toLocaleString()}</td>
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
            )}
          </div>

          {/* Your Impact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">Your Impact</h2>
            </div>
            <div className="p-6">
              {impact && impact.allocations.length > 0 && (
                <div className="mb-6">
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
              {snapshots.length > 0 ? (
                <div className="space-y-5">
                  {(impact?.allocations?.length ?? 0) > 0 && <h3 className="text-sm font-semibold text-gray-700">Impact Stories</h3>}
                  {snapshots.map(s => (
                    <div key={s.snapshotId} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">{s.headline}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{s.summaryText}</p>
                      <p className="text-xs text-gray-400 mt-2">{s.snapshotDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                (impact?.allocations?.length ?? 0) === 0 && <p className="text-sm text-gray-400">No impact stories available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — Profile + CTAs */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Your Profile</h3>
            <div className="space-y-3.5 text-sm">
              {[
                { label: 'Email', value: donor.email ?? '—' },
                { label: 'Country', value: donor.country ?? '—' },
                { label: 'Member Since', value: donor.firstDonationDate ?? donor.createdAt?.split('T')[0] ?? '—' },
                { label: 'Channel', value: donor.acquisitionChannel ?? '—' },
              ].map(field => (
                <div key={field.label}>
                  <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">{field.label}</span>
                  <span className="text-gray-900 mt-0.5 block">{field.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowDonateForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-haven-600 to-haven-700 text-white font-medium py-3.5 rounded-2xl hover:from-haven-700 hover:to-haven-800 transition-all shadow-sm hover:shadow-md"
            >
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

      {/* Donation Modal */}
      <Modal open={showDonateForm} onClose={() => { setShowDonateForm(false); setDonateSuccess(false); }} title="Make a Donation">
        {donateSuccess ? (
          <div className="text-center py-6">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Thank you!</h3>
            <p className="text-sm text-gray-500 mt-1">Your donation has been recorded.</p>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Donation Type</label>
              <select value={donateForm.donationType} onChange={e => setDonateForm(f => ({ ...f, donationType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
                <option>Monetary</option><option>InKind</option><option>Time</option><option>Skills</option><option>SocialMedia</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                <input type="number" min="1" step="any" required value={donateForm.amount || ''} onChange={e => setDonateForm(f => ({ ...f, amount: +e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                <select value={donateForm.currencyCode} onChange={e => setDonateForm(f => ({ ...f, currencyCode: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
                  <option>PHP</option><option>USD</option><option>SGD</option><option>CAD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign (optional)</label>
              <input value={donateForm.campaignName} onChange={e => setDonateForm(f => ({ ...f, campaignName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="e.g., Holiday Drive 2026" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={donateForm.isRecurring} onChange={e => setDonateForm(f => ({ ...f, isRecurring: e.target.checked }))} className="rounded border-gray-300 text-haven-600 focus:ring-haven-500" />
              Make this a recurring monthly donation
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowDonateForm(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
              <button type="submit" disabled={donateLoading} className="px-4 py-2.5 text-sm font-medium text-white bg-haven-600 rounded-xl hover:bg-haven-700 transition-all shadow-sm disabled:opacity-60">
                {donateLoading ? 'Processing...' : 'Submit Donation'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
