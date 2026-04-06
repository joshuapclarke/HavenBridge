import { useEffect, useState } from 'react';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ImpactOverview, SupporterSummary, AlertsData } from '../types/models';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarSquareIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

type Safehouse = {
  safehouseId: number;
  name: string;
  city: string;
  capacityGirls: number;
  currentOccupancy: number;
  status: string;
};

function normalizeSafehouse(raw: Record<string, unknown>): Safehouse {
  return {
    safehouseId: Number(raw.safehouseId),
    name: String(raw.name ?? ''),
    city: String(raw.city ?? raw.region ?? '—'),
    capacityGirls: Number(raw.capacityGirls ?? 0),
    currentOccupancy: Number(raw.currentOccupancy ?? 0),
    status: String(raw.status ?? ''),
  };
}

function occupancyPercent(capacity: number, occupied: number): number {
  if (capacity <= 0) return occupied > 0 ? 100 : 0;
  return Math.min(100, Math.round((occupied / capacity) * 1000) / 10);
}

export default function ReportsPage() {
  const [overview, setOverview] = useState<ImpactOverview | null>(null);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [supporterSummary, setSupporterSummary] = useState<SupporterSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.impact.overview(),
      api.safehouses.list(),
      api.supporters.summary(),
      api.residents.alerts(),
    ])
      .then(([ov, sh, sup, al]) => {
        setOverview(ov as ImpactOverview);
        setSafehouses((Array.isArray(sh) ? sh : []).map((row) => normalizeSafehouse(row as Record<string, unknown>)));
        setSupporterSummary(sup as SupporterSummary);
        setAlerts(al as AlertsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-haven-50 text-haven-600 shrink-0">
            <ChartBarSquareIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-gray-500 mt-2 max-w-3xl text-base">
              Aggregated operational insights, safehouse utilization, donor health, and risk signals for internal
              staff review.
            </p>
          </div>
        </div>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <SummaryCard
            title="Active Residents"
            value={overview.totalResidents}
            icon={<UserGroupIcon className="h-7 w-7" />}
          />
          <SummaryCard
            title="Total Sessions"
            value={overview.totalSessions.toLocaleString()}
            icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />}
            accent="border-warm-500"
          />
          <SummaryCard
            title="Active Safehouses"
            value={overview.activeSafehouses}
            icon={<BuildingOfficeIcon className="h-7 w-7" />}
            accent="border-violet-500"
          />
          <SummaryCard
            title="Total Donations"
            value={`$${Number(overview.totalDonations).toLocaleString()}`}
            icon={<CurrencyDollarIcon className="h-7 w-7" />}
            accent="border-emerald-500"
          />
        </div>
      )}

      {/* Safehouse Overview */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-5">Safehouse Overview</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">City</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Capacity</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Current</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider min-w-[200px]">Utilization</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {safehouses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                      No safehouse data available.
                    </td>
                  </tr>
                ) : (
                  safehouses.map((sh) => {
                    const pct = occupancyPercent(sh.capacityGirls, sh.currentOccupancy);
                    const barColor =
                      pct >= 95 ? 'bg-red-500' : pct >= 80 ? 'bg-warm-500' : 'bg-haven-500';
                    return (
                      <tr key={sh.safehouseId} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-900">{sh.name}</td>
                        <td className="px-5 py-4 text-gray-600">{sh.city}</td>
                        <td className="px-5 py-4 text-right text-gray-700 tabular-nums">{sh.capacityGirls}</td>
                        <td className="px-5 py-4 text-right text-gray-700 tabular-nums">
                          {sh.currentOccupancy}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden min-w-[120px]">
                              <div
                                className={`h-full rounded-full transition-all ${barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 tabular-nums w-12 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                              sh.status?.toLowerCase() === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {sh.status || '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Donor Overview */}
      {supporterSummary && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
            <HeartIcon className="h-6 w-6 text-warm-600" />
            Donor Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total donors', value: supporterSummary.total, color: 'from-haven-500 to-haven-600' },
              { label: 'Active donors', value: supporterSummary.active, color: 'from-emerald-500 to-emerald-600' },
              { label: 'At-risk donors', value: supporterSummary.atRisk, color: 'from-warm-500 to-warm-600' },
              { label: 'Avg gift size', value: `$${Number(supporterSummary.avgGift).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'from-violet-500 to-violet-600' },
            ].map((card) => (
              <div key={card.label} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6">
                <div className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${card.color} mb-4`} />
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{card.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Alerts Summary */}
      {alerts && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
            Active Alerts Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: 'High-risk residents', count: alerts.highRisk?.length ?? 0, bg: 'bg-gradient-to-br from-red-50 to-red-100', border: 'border-red-200', text: 'text-red-900', num: 'text-red-950' },
              { label: 'Flagged sessions', count: alerts.flaggedSessions?.length ?? 0, bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-200', text: 'text-amber-900', num: 'text-amber-950' },
              { label: 'Unresolved incidents', count: alerts.unresolvedIncidents?.length ?? 0, bg: 'bg-gradient-to-br from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-900', num: 'text-orange-950' },
            ].map((alert) => (
              <div key={alert.label} className={`rounded-2xl p-6 ${alert.bg} border ${alert.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                <p className={`text-sm font-semibold ${alert.text}`}>{alert.label}</p>
                <p className={`text-3xl font-bold ${alert.num} mt-2 tabular-nums`}>{alert.count}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
