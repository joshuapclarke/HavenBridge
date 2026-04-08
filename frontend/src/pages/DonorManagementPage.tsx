import { useEffect, useState } from 'react';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import type { Supporter, SupporterSummary, DonorImpact } from '../types/models';
import Pagination from '../components/Pagination';
import usePageTitle from '../hooks/usePageTitle';
import {
  UserGroupIcon,
  UserIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  PlusIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

export default function DonorManagementPage() {
  usePageTitle('Donor Management');
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [summary, setSummary] = useState<SupporterSummary | null>(null);
  const [selected, setSelected] = useState<Supporter | null>(null);
  const [impact, setImpact] = useState<DonorImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showNewSupporterForm, setShowNewSupporterForm] = useState(false);
  const [showEditSupporterForm, setShowEditSupporterForm] = useState(false);
  const [editSupporterForm, setEditSupporterForm] = useState<Record<string, any>>({});
  const [newSupporter, setNewSupporter] = useState({ supporterType: 'Individual', firstName: '', lastName: '', displayName: '', organizationName: '', email: '', phone: '', country: 'Philippines', region: '', acquisitionChannel: 'Direct' });
  const [donationForm, setDonationForm] = useState({ donationType: 'Monetary', amount: 0, campaignName: '', currencyCode: 'PHP', isRecurring: false });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  const handleAddDonation = async () => {
    if (!selected) return;
    await api.donations.create({
      supporterId: selected.supporterId,
      donationDate: new Date().toISOString().split('T')[0],
      ...donationForm,
      channelSource: 'Direct',
    });
    const detail = await api.supporters.get(selected.supporterId);
    setSelected(detail);
    const imp = await api.impact.donorImpact(selected.supporterId);
    setImpact(imp);
    setShowDonationForm(false);
    setDonationForm({ donationType: 'Monetary', amount: 0, campaignName: '', currencyCode: 'PHP', isRecurring: false });
  };

  const handleCreateSupporter = async () => {
    const name = newSupporter.supporterType === 'Organization'
      ? newSupporter.organizationName
      : `${newSupporter.firstName} ${newSupporter.lastName}`.trim();
    if (!name) return;
    const payload = { ...newSupporter, displayName: name, status: 'Active' };
    const created = await api.supporters.create(payload);
    setSupporters(prev => [created, ...prev]);
    const sum = await api.supporters.summary();
    setSummary(sum);
    setShowNewSupporterForm(false);
    setNewSupporter({ supporterType: 'Individual', firstName: '', lastName: '', displayName: '', organizationName: '', email: '', phone: '', country: 'Philippines', region: '', acquisitionChannel: 'Direct' });
  };

  const openEditSupporter = () => {
    if (!selected) return;
    setEditSupporterForm({
      displayName: selected.displayName ?? '',
      email: selected.email ?? '',
      phone: selected.phone ?? '',
      country: selected.country ?? '',
      region: selected.region ?? '',
      acquisitionChannel: selected.acquisitionChannel ?? '',
    });
    setShowEditSupporterForm(true);
  };

  const handleEditSupporter = async () => {
    if (!selected) return;
    const updated = await api.supporters.update(selected.supporterId, editSupporterForm);
    setSelected(updated);
    setSupporters(prev => prev.map(s => s.supporterId === selected.supporterId ? { ...s, ...editSupporterForm } : s));
    setShowEditSupporterForm(false);
  };

  const handleFlagAtRisk = async () => {
    if (!selected) return;
    const updated = await api.supporters.flagAtRisk(selected.supporterId);
    setSelected({ ...selected, status: updated.status });
    setSupporters(prev => prev.map(s => s.supporterId === selected.supporterId ? { ...s, status: updated.status } : s));
    const sum = await api.supporters.summary();
    setSummary(sum);
  };

  const loadSupporters = async (p: number) => {
    const [res, sum] = await Promise.all([api.supporters.list(p, PAGE_SIZE), api.supporters.summary()]);
    setSupporters(res.items);
    setTotalCount(res.totalCount);
    setPage(res.page);
    setSummary(sum);
  };

  useEffect(() => {
    loadSupporters(1).finally(() => setLoading(false));
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
    <main className="max-w-[1600px] mx-auto px-6 py-10" aria-label="Donor Management">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Donor Management</h1>
          <p className="text-gray-500 mt-2 text-base">Track and manage all donors and their giving history.</p>
        </div>
        <button onClick={() => setShowNewSupporterForm(true)} className="flex items-center gap-1.5 px-5 py-2.5 bg-haven-600 text-white text-sm font-semibold rounded-xl hover:bg-haven-700 transition-all shadow-sm hover:shadow-md">
          <PlusIcon className="h-5 w-5" /> New Supporter
        </button>
      </div>

      {summary && (
        <section aria-label="Donor summary statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <SummaryCard title="Total Donors" value={summary.total} icon={<UserGroupIcon className="h-7 w-7" />} />
          <SummaryCard title="Active Donors" value={summary.active} icon={<UserIcon className="h-7 w-7" />} accent="border-emerald-500" />
          <SummaryCard title="At-Risk Donors" value={summary.atRisk} icon={<ExclamationCircleIcon className="h-7 w-7" />} accent="border-red-500" />
          <SummaryCard title="Avg Gift Size" value={`$${summary.avgGift.toLocaleString()}`} icon={<BanknotesIcon className="h-7 w-7" />} accent="border-warm-500" />
        </section>
      )}

      <div className="flex gap-6">
        <section aria-label="Donor list" className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Gift</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Given</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {supporters.map(s => (
                  <tr
                    key={s.supporterId}
                    onClick={() => selectDonor(s)}
                    className={`cursor-pointer transition-all ${
                      selected?.supporterId === s.supporterId ? 'bg-haven-50' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{s.displayName}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{lastGift(s)}</td>
                    <td className="px-5 py-4 text-sm text-right font-medium text-gray-900 tabular-nums">
                      ${totalGiven(s).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge level={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={loadSupporters} />
          </div>
        </section>

        <aside aria-label="Donor details" className="w-80 shrink-0">
          {!selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
              Select a donor to view details.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-2xl bg-haven-100 flex items-center justify-center">
                    <span className="text-haven-700 font-bold text-lg">{selected.displayName[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selected.displayName}</h3>
                    <p className="text-xs text-gray-500">{selected.supporterType} &middot; {selected.country}</p>
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900 text-right truncate ml-2">{selected.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge level={selected.status} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Channel</span><span className="text-gray-900">{selected.acquisitionChannel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">First Gift</span><span className="text-gray-900">{selected.firstDonationDate}</span></div>
                </div>
              </div>

              {/* Giving History */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700">Giving History</h4>
                </div>
                <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                  {selected.donations?.map(d => (
                    <div key={d.donationId} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900 tabular-nums">{d.currencyCode} {d.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{d.donationDate} {d.campaignName && `· ${d.campaignName}`}</p>
                      </div>
                      {d.isRecurring && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-medium">Recurring</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Summary */}
              {impact && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Impact Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Total Given</span><span className="font-semibold tabular-nums">${impact.totalGiven.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Donations</span><span className="font-semibold tabular-nums">{impact.donationCount}</span></div>
                  </div>
                  {impact.allocations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Allocations</p>
                      {impact.allocations.map((a, i) => (
                        <div key={i} className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600">{a.programArea} — {a.safehouseName}</span>
                          <span className="font-medium tabular-nums">${a.amountAllocated.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowDonationForm(true)} className="flex-1 flex items-center justify-center gap-1.5 bg-haven-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-haven-700 transition-all shadow-sm hover:shadow-md">
                  <PlusIcon className="h-4 w-4" /> Add Donation
                </button>
                <button onClick={openEditSupporter} className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-all">
                  <PencilSquareIcon className="h-4 w-4" /> Edit
                </button>
              </div>
              <button
                onClick={handleFlagAtRisk}
                className={`w-full text-sm font-medium py-2.5 rounded-xl transition-all ${
                  selected.status === 'At-Risk'
                    ? 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    : 'border border-red-200 text-red-700 hover:bg-red-50'
                }`}
              >
                {selected.status === 'At-Risk' ? 'Remove At-Risk Flag' : 'Flag At-Risk'}
              </button>
            </div>
          )}
        </aside>
      </div>

      <Modal open={showDonationForm} onClose={() => setShowDonationForm(false)} title="Record Donation">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Donation Type</label>
            <select value={donationForm.donationType} onChange={e => setDonationForm(f => ({ ...f, donationType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
              <option>Monetary</option><option>InKind</option><option>Time</option><option>Skills</option><option>SocialMedia</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
              <input type="number" value={donationForm.amount} onChange={e => setDonationForm(f => ({ ...f, amount: +e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={donationForm.currencyCode} onChange={e => setDonationForm(f => ({ ...f, currencyCode: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
                <option>PHP</option><option>USD</option><option>SGD</option><option>CAD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign</label>
            <input value={donationForm.campaignName} onChange={e => setDonationForm(f => ({ ...f, campaignName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="Optional campaign name" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={donationForm.isRecurring} onChange={e => setDonationForm(f => ({ ...f, isRecurring: e.target.checked }))} className="rounded border-gray-300 text-haven-600 focus:ring-haven-500" />
            Recurring Donation
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowDonationForm(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={handleAddDonation} className="px-4 py-2.5 text-sm font-medium text-white bg-haven-600 rounded-xl hover:bg-haven-700 transition-all shadow-sm">Save Donation</button>
          </div>
        </div>
      </Modal>

      <Modal open={showEditSupporterForm} onClose={() => setShowEditSupporterForm(false)} title="Edit Supporter">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
            <input value={editSupporterForm.displayName ?? ''} onChange={e => setEditSupporterForm(f => ({ ...f, displayName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={editSupporterForm.email ?? ''} onChange={e => setEditSupporterForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input type="tel" value={editSupporterForm.phone ?? ''} onChange={e => setEditSupporterForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input value={editSupporterForm.country ?? ''} onChange={e => setEditSupporterForm(f => ({ ...f, country: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
              <input value={editSupporterForm.region ?? ''} onChange={e => setEditSupporterForm(f => ({ ...f, region: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Acquisition Channel</label>
            <select value={editSupporterForm.acquisitionChannel ?? ''} onChange={e => setEditSupporterForm(f => ({ ...f, acquisitionChannel: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
              <option>Direct</option><option>Social Media</option><option>Referral</option><option>Event</option><option>Website</option><option>Church Partner</option><option>Corporate</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowEditSupporterForm(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={handleEditSupporter} className="px-4 py-2.5 text-sm font-medium text-white bg-haven-600 rounded-xl hover:bg-haven-700 transition-all shadow-sm">Save Changes</button>
          </div>
        </div>
      </Modal>

      <Modal open={showNewSupporterForm} onClose={() => setShowNewSupporterForm(false)} title="New Supporter">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Supporter Type</label>
            <select value={newSupporter.supporterType} onChange={e => setNewSupporter(f => ({ ...f, supporterType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
              <option>Individual</option><option>Organization</option><option>Church</option><option>Foundation</option>
            </select>
          </div>
          {newSupporter.supporterType === 'Organization' || newSupporter.supporterType === 'Church' || newSupporter.supporterType === 'Foundation' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization Name</label>
              <input value={newSupporter.organizationName} onChange={e => setNewSupporter(f => ({ ...f, organizationName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="Organization name" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input value={newSupporter.firstName} onChange={e => setNewSupporter(f => ({ ...f, firstName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input value={newSupporter.lastName} onChange={e => setNewSupporter(f => ({ ...f, lastName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={newSupporter.email} onChange={e => setNewSupporter(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input type="tel" value={newSupporter.phone} onChange={e => setNewSupporter(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="+63 ..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input value={newSupporter.country} onChange={e => setNewSupporter(f => ({ ...f, country: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
              <input value={newSupporter.region} onChange={e => setNewSupporter(f => ({ ...f, region: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="e.g. NCR, Visayas" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Acquisition Channel</label>
            <select value={newSupporter.acquisitionChannel} onChange={e => setNewSupporter(f => ({ ...f, acquisitionChannel: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
              <option>Direct</option><option>Social Media</option><option>Referral</option><option>Event</option><option>Website</option><option>Church Partner</option><option>Corporate</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowNewSupporterForm(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={handleCreateSupporter} className="px-4 py-2.5 text-sm font-medium text-white bg-haven-600 rounded-xl hover:bg-haven-700 transition-all shadow-sm">Create Supporter</button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
