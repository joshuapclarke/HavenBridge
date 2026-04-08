import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ImpactOverview, SupporterSummary, AlertsData } from '../types/models';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarSquareIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

type Safehouse = {
  safehouseId: number;
  name: string;
  city: string;
  capacityGirls: number;
  currentOccupancy: number;
  status: string;
};

interface ChartData {
  donationsByMonth: { year: number; month: number; total: number; count: number }[];
  sessionsByMonth: { year: number; month: number; count: number }[];
  residentsByCategory: { category: string; count: number }[];
  residentsByRisk: { level: string; count: number }[];
  sessionsByType: { type: string; count: number }[];
  visitsByMonth: { year: number; month: number; count: number }[];
  educationByStatus: { status: string; count: number }[];
  healthOverTime: { year: number; month: number; avgHealth: number; avgNutrition: number; avgSleep: number }[];
  reintegrationByStatus: { status: string; count: number }[];
}

interface MlPipelineSummary {
  id: string;
  title: string;
  objective: string;
  keyMetrics: string[];
  insights: string[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PIE_COLORS = ['#4f6d7a', '#c0d6df', '#db6d3c', '#dbc49c', '#8b5e3c', '#6b9080', '#a4c3b2', '#cce3de'];
const RISK_COLORS: Record<string, string> = { Critical: '#dc2626', High: '#ef4444', Medium: '#f59e0b', Low: '#10b981', Unknown: '#9ca3af' };

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

function monthLabel(y: number, m: number) {
  return `${MONTH_NAMES[m - 1]} ${String(y).slice(2)}`;
}

export default function ReportsPage() {
  const [overview, setOverview] = useState<ImpactOverview | null>(null);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [supporterSummary, setSupporterSummary] = useState<SupporterSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [mlPipelines, setMlPipelines] = useState<MlPipelineSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.impact.overview(),
      api.safehouses.list(),
      api.supporters.summary(),
      api.residents.alerts(),
      api.reports.charts(),
      api.reports.mlPipelines(),
    ])
      .then(([ov, sh, sup, al, ch, ml]) => {
        setOverview(ov as ImpactOverview);
        setSafehouses((Array.isArray(sh) ? sh : []).map((row) => normalizeSafehouse(row as Record<string, unknown>)));
        setSupporterSummary(sup as SupporterSummary);
        setAlerts(al as AlertsData);
        setCharts(ch as ChartData);
        setMlPipelines(Array.isArray(ml?.pipelines) ? (ml.pipelines as MlPipelineSummary[]) : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const donationTimeline = charts?.donationsByMonth.map(d => ({
    label: monthLabel(d.year, d.month),
    amount: Math.round(d.total),
    count: d.count,
  })) ?? [];

  const activityTimeline = (() => {
    const map = new Map<string, { sessions: number; visits: number }>();
    charts?.sessionsByMonth.forEach(s => {
      const key = monthLabel(s.year, s.month);
      const entry = map.get(key) ?? { sessions: 0, visits: 0 };
      entry.sessions = s.count;
      map.set(key, entry);
    });
    charts?.visitsByMonth.forEach(v => {
      const key = monthLabel(v.year, v.month);
      const entry = map.get(key) ?? { sessions: 0, visits: 0 };
      entry.visits = v.count;
      map.set(key, entry);
    });
    return Array.from(map.entries()).map(([label, val]) => ({ label, ...val }));
  })();

  const riskData = charts?.residentsByRisk.map(r => ({
    name: r.level,
    value: r.count,
    fill: RISK_COLORS[r.level] ?? '#9ca3af',
  })) ?? [];

  const categoryData = charts?.residentsByCategory ?? [];
  const sessionTypeData = charts?.sessionsByType ?? [];

  const educationData = charts?.educationByStatus ?? [];
  const healthTimeline = charts?.healthOverTime.map(h => ({
    label: monthLabel(h.year, h.month),
    health: h.avgHealth,
    nutrition: h.avgNutrition,
    sleep: h.avgSleep,
  })) ?? [];
  const reintegrationData = charts?.reintegrationByStatus ?? [];

  const REINTEGRATION_COLORS: Record<string, string> = {
    'Successful': '#10b981', 'In Progress': '#3b82f6', 'Pending': '#f59e0b',
    'Failed': '#ef4444', 'On Hold': '#9ca3af',
  };

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-10" aria-label="Reports and Analytics">
      <div className="mb-10 flex items-start justify-between">
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
        <Link
          to="/annual-report"
          className="flex items-center gap-2 px-5 py-2.5 bg-haven-600 text-white text-sm font-semibold rounded-xl hover:bg-haven-700 transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <DocumentTextIcon className="h-5 w-5" /> Annual Report
        </Link>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <SummaryCard title="Active Residents" value={overview.totalResidents} icon={<UserGroupIcon className="h-7 w-7" />} />
          <SummaryCard title="Total Sessions" value={overview.totalSessions.toLocaleString()} icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />} accent="border-warm-500" />
          <SummaryCard title="Active Safehouses" value={overview.activeSafehouses} icon={<BuildingOfficeIcon className="h-7 w-7" />} accent="border-violet-500" />
          <SummaryCard title="Total Donations" value={`$${Number(overview.totalDonations).toLocaleString()}`} icon={<CurrencyDollarIcon className="h-7 w-7" />} accent="border-emerald-500" />
        </div>
      )}

      {/* ML Pipelines */}
      <section aria-label="Machine learning pipeline outputs" className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-5">ML Pipeline Results</h2>
        {mlPipelines.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
            No ML pipeline summaries available.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {mlPipelines.map((pipeline) => (
              <article key={pipeline.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900">{pipeline.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{pipeline.objective}</p>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Key Metrics</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {pipeline.keyMetrics.map((metric) => (
                      <li key={metric}>- {metric}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Insights</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {pipeline.insights.map((insight) => (
                      <li key={insight}>- {insight}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Charts Row 1: Donations & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <section aria-label="Donation trends" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Donation Trends</h2>
          <p className="text-sm text-gray-500 mb-5">Monthly donation totals</p>
          {donationTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={donationTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#4f6d7a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No donation data available.</p>
          )}
        </section>

        <section aria-label="Sessions and home visits" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Sessions & Home Visits</h2>
          <p className="text-sm text-gray-500 mb-5">Monthly case activity</p>
          {activityTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activityTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sessions" stroke="#4f6d7a" strokeWidth={2.5} dot={{ r: 3 }} name="Sessions" />
                <Line type="monotone" dataKey="visits" stroke="#db6d3c" strokeWidth={2.5} dot={{ r: 3 }} name="Home Visits" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No session data available.</p>
          )}
        </section>
      </div>

      {/* Charts Row 2: Pie/Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <section aria-label="Risk distribution" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Risk Distribution</h2>
          <p className="text-sm text-gray-500 mb-4">Active residents by risk level</p>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} style={{ fontSize: 11 }}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No resident data.</p>
          )}
        </section>

        <section aria-label="Case categories" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Case Categories</h2>
          <p className="text-sm text-gray-500 mb-4">Active residents by category</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} paddingAngle={2} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} style={{ fontSize: 11 }}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No category data.</p>
          )}
        </section>

        <section aria-label="Session types" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Session Types</h2>
          <p className="text-sm text-gray-500 mb-4">All sessions by type</p>
          {sessionTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sessionTypeData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#db6d3c" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No session data.</p>
          )}
        </section>
      </div>

      {/* Charts Row 3: Education, Health, Reintegration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <section aria-label="Education progress" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Education Progress</h2>
          <p className="text-sm text-gray-500 mb-4">Records by completion status</p>
          {educationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={educationData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} paddingAngle={2} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} style={{ fontSize: 11 }}>
                  {educationData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No education data.</p>
          )}
        </section>

        <section aria-label="Health improvement" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Health Improvement</h2>
          <p className="text-sm text-gray-500 mb-5">Average scores over time</p>
          {healthTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={healthTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 10]} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Health" />
                <Line type="monotone" dataKey="nutrition" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Nutrition" />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} name="Sleep" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No health data.</p>
          )}
        </section>

        <section aria-label="Reintegration outcomes" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Reintegration Outcomes</h2>
          <p className="text-sm text-gray-500 mb-4">Residents by reintegration status</p>
          {reintegrationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={reintegrationData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} style={{ fontSize: 11 }}>
                  {reintegrationData.map((entry, i) => <Cell key={i} fill={REINTEGRATION_COLORS[entry.status] ?? PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-20 text-center">No reintegration data.</p>
          )}
        </section>
      </div>

      {/* Safehouse Overview */}
      <section aria-label="Safehouse overview" className="mb-12">
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
                        <td className="px-5 py-4 text-right text-gray-700 tabular-nums">{sh.currentOccupancy}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden min-w-[120px]">
                              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 tabular-nums w-12 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${sh.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
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
        <section aria-label="Donor overview" className="mb-12">
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
        <section aria-label="Active alerts summary">
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
    </main>
  );
}
