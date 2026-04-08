import { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';
import usePageTitle from '../hooks/usePageTitle';

interface AnnualData {
  year: number;
  availableYears: number[];
  residents: {
    admissions: number;
    discharges: number;
    activeAtYearEnd: number;
    byCategory: { category: string; count: number }[];
    bySafehouse: { safehouse: string; count: number }[];
  };
  sessions: {
    total: number;
    totalMinutes: number;
    byType: { type: string; count: number }[];
  };
  homeVisits: number;
  conferences: number;
  education: {
    enrolled: number;
    completed: number;
    avgAttendance: number;
  };
  health: {
    records: number;
    avgHealthScore: number;
    avgNutritionScore: number;
  };
  reintegration: { status: string; count: number }[];
  donations: {
    totalAmount: number;
    count: number;
    uniqueDonors: number;
  };
  incidents: {
    total: number;
    resolved: number;
  };
}

export default function AnnualReportPage() {
  usePageTitle('Annual Report');
  const [data, setData] = useState<AnnualData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const load = (y: number) => {
    setLoading(true);
    api.reports.annual(y).then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { load(year); }, []);

  const changeYear = (y: number) => {
    setYear(y);
    load(y);
  };

  if (loading && !data) return <LoadingSpinner />;

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 print:px-0 print:py-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 print:mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-haven-50 text-haven-600 shrink-0 print:hidden">
            <DocumentTextIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight print:text-2xl">Annual Accomplishment Report</h1>
            <p className="text-gray-500 mt-1 text-base">HavenBridge Foundation &middot; Year {year}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <select
            value={year}
            onChange={e => changeYear(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none"
          >
            {(data?.availableYears ?? [year]).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-haven-600 text-white text-sm font-semibold rounded-xl hover:bg-haven-700 transition-all shadow-sm"
          >
            <PrinterIcon className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : data && (
        <div className="space-y-8 print:space-y-5">
          {/* 1. Residents Served */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">1. Residents Served</h2>
            <div className="grid grid-cols-3 gap-5 mb-5">
              {[
                { label: 'New Admissions', value: data.residents.admissions, color: 'bg-haven-50 text-haven-800' },
                { label: 'Discharges / Closed', value: data.residents.discharges, color: 'bg-warm-50 text-warm-800' },
                { label: 'Active (Year-End)', value: data.residents.activeAtYearEnd, color: 'bg-emerald-50 text-emerald-800' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                  <p className="text-sm font-medium opacity-80">{s.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            {data.residents.byCategory.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">By Case Category</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  {data.residents.byCategory.map(c => (
                    <div key={c.category} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-700">{c.category}</span>
                      <span className="font-semibold text-gray-900 tabular-nums">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.residents.bySafehouse.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">By Safehouse</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  {data.residents.bySafehouse.map(s => (
                    <div key={s.safehouse} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-700">{s.safehouse}</span>
                      <span className="font-semibold text-gray-900 tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 2. Counseling & Sessions */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">2. Counseling & Process Recording</h2>
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div className="rounded-xl p-4 bg-haven-50 text-haven-800">
                <p className="text-sm font-medium opacity-80">Total Sessions</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.sessions.total.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 bg-violet-50 text-violet-800">
                <p className="text-sm font-medium opacity-80">Total Hours</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{Math.round(data.sessions.totalMinutes / 60).toLocaleString()}</p>
              </div>
            </div>
            {data.sessions.byType.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">By Session Type</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  {data.sessions.byType.map(t => (
                    <div key={t.type} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-700">{t.type}</span>
                      <span className="font-semibold text-gray-900 tabular-nums">{t.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 3. Home Visitations & Case Conferences */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">3. Home Visitation & Case Conferences</h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-xl p-4 bg-warm-50 text-warm-800">
                <p className="text-sm font-medium opacity-80">Total Home Visits</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.homeVisits.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 bg-haven-50 text-haven-800">
                <p className="text-sm font-medium opacity-80">Case Conferences Held</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{(data.conferences ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* 3b. Education Outcomes */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">4. Education Outcomes</h2>
            <div className="grid grid-cols-3 gap-5">
              <div className="rounded-xl p-4 bg-blue-50 text-blue-800">
                <p className="text-sm font-medium opacity-80">Enrolled / Active</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{(data.education?.enrolled ?? 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 bg-emerald-50 text-emerald-800">
                <p className="text-sm font-medium opacity-80">Completed / Graduated</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{(data.education?.completed ?? 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 bg-violet-50 text-violet-800">
                <p className="text-sm font-medium opacity-80">Avg Attendance</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{(data.education?.avgAttendance ?? 0)}%</p>
              </div>
            </div>
          </section>

          {/* 3c. Health & Wellbeing */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">5. Health & Wellbeing</h2>
            <div className="grid grid-cols-3 gap-5">
              <div className="rounded-xl p-4 bg-emerald-50 text-emerald-800">
                <p className="text-sm font-medium opacity-80">Health Records</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{(data.health?.records ?? 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 bg-haven-50 text-haven-800">
                <p className="text-sm font-medium opacity-80">Avg Health Score</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{(data.health?.avgHealthScore ?? 0)}/10</p>
              </div>
              <div className="rounded-xl p-4 bg-blue-50 text-blue-800">
                <p className="text-sm font-medium opacity-80">Avg Nutrition Score</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{(data.health?.avgNutritionScore ?? 0)}/10</p>
              </div>
            </div>
          </section>

          {/* 3d. Reintegration */}
          {(data.reintegration?.length ?? 0) > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
              <h2 className="text-lg font-bold text-gray-900 mb-4">6. Reintegration Status</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                {data.reintegration.map(r => (
                  <div key={r.status} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-700">{r.status}</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{r.count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Donations & Fundraising */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">7. Donations & Fundraising</h2>
            <div className="grid grid-cols-3 gap-5">
              <div className="rounded-xl p-4 bg-emerald-50 text-emerald-800">
                <p className="text-sm font-medium opacity-80">Total Raised</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">${Math.round(data.donations.totalAmount).toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 bg-blue-50 text-blue-800">
                <p className="text-sm font-medium opacity-80">Donations Received</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.donations.count.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 bg-violet-50 text-violet-800">
                <p className="text-sm font-medium opacity-80">Unique Donors</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.donations.uniqueDonors.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* 8. Incidents */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border print:rounded-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">8. Incident Reports</h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-xl p-4 bg-red-50 text-red-800">
                <p className="text-sm font-medium opacity-80">Total Incidents</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.incidents.total}</p>
              </div>
              <div className="rounded-xl p-4 bg-emerald-50 text-emerald-800">
                <p className="text-sm font-medium opacity-80">Resolved</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.incidents.resolved}</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pt-4 print:pt-2">
            Generated {new Date().toLocaleDateString()} &middot; HavenBridge Foundation Annual Report {year}
          </div>
        </div>
      )}
    </div>
  );
}
