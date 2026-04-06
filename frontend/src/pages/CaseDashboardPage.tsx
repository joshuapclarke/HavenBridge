import { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Resident, AlertsData } from '../types/models';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

type Tab = 'sessions' | 'health' | 'education' | 'visits' | 'notes';

export default function CaseDashboardPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selected, setSelected] = useState<Resident | null>(null);
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.residents.list(), api.residents.alerts()])
      .then(([r, a]) => { setResidents(r); setAlerts(a); })
      .finally(() => setLoading(false));
  }, []);

  const selectResident = async (id: number) => {
    const detail = await api.residents.get(id);
    setSelected(detail);
    setActiveTab('sessions');
  };

  if (loading) return <LoadingSpinner />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sessions', label: 'Counseling Sessions' },
    { key: 'health', label: 'Health' },
    { key: 'education', label: 'Education' },
    { key: 'visits', label: 'Home Visits' },
    { key: 'notes', label: 'Case Notes' },
  ];

  const riskDot = (level?: string | null) => {
    if (level === 'High') return 'bg-red-500';
    if (level === 'Medium') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const totalAlerts = alerts
    ? alerts.highRisk.length + alerts.flaggedSessions.length + alerts.unresolvedIncidents.length
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Resident Case Dashboard</h1>

      <div className="flex gap-6">
        {/* Left Sidebar — Resident List */}
        <aside className="w-72 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Residents ({residents.length})</h3>
            </div>
            <ul className="divide-y divide-gray-100 max-h-[calc(100vh-220px)] overflow-y-auto">
              {residents.map(r => (
                <li key={r.residentId}>
                  <button
                    onClick={() => selectResident(r.residentId)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      selected?.residentId === r.residentId ? 'bg-haven-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${riskDot(r.currentRiskLevel)}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.internalCode}</p>
                      <p className="text-xs text-gray-500">{r.caseCategory} &middot; {r.assignedSocialWorker}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center h-96 text-gray-400">
              Select a resident from the list to view their case.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">{selected.internalCode}</h2>
                      <StatusBadge level={selected.currentRiskLevel} size="md" />
                      <StatusBadge level={selected.caseStatus} size="md" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {selected.caseCategory} &middot; Case {selected.caseControlNo} &middot; {selected.safehouse?.name}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Age: <span className="font-medium text-gray-900">{selected.presentAge}</span></p>
                    <p>Admitted: <span className="font-medium text-gray-900">{selected.dateOfAdmission}</span></p>
                    <p>Worker: <span className="font-medium text-gray-900">{selected.assignedSocialWorker}</span></p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6">
                  <nav className="flex gap-6 -mb-px">
                    {tabs.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === t.key
                            ? 'border-haven-600 text-haven-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'sessions' && (
                    <div className="space-y-4">
                      {(selected.processRecordings?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No sessions recorded yet.</p>}
                      {selected.processRecordings?.map(s => (
                        <div key={s.recordingId} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{s.sessionType}</span>
                              {s.concernsFlagged && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Concern</span>}
                              {s.progressNoted && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Progress</span>}
                            </div>
                            <span className="text-xs text-gray-500">{s.sessionDate} &middot; {s.sessionDurationMinutes} min</span>
                          </div>
                          <p className="text-sm text-gray-700">{s.sessionNarrative}</p>
                          {s.followUpActions && <p className="text-xs text-gray-500 mt-2">Follow-up: {s.followUpActions}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'health' && (
                    <div className="space-y-4">
                      {(selected.healthRecords?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No health records yet.</p>}
                      {selected.healthRecords?.map(h => (
                        <div key={h.healthRecordId} className="border border-gray-100 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-3">{h.recordDate}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div><span className="text-gray-500">Health</span><p className="font-semibold">{h.generalHealthScore}/10</p></div>
                            <div><span className="text-gray-500">Nutrition</span><p className="font-semibold">{h.nutritionScore}/10</p></div>
                            <div><span className="text-gray-500">Sleep</span><p className="font-semibold">{h.sleepQualityScore}/10</p></div>
                            <div><span className="text-gray-500">Energy</span><p className="font-semibold">{h.energyLevelScore}/10</p></div>
                          </div>
                          <div className="mt-3 flex gap-4 text-xs text-gray-500">
                            <span>Height: {h.heightCm} cm</span>
                            <span>Weight: {h.weightKg} kg</span>
                            <span>BMI: {h.bmi}</span>
                          </div>
                          {h.notes && <p className="text-sm text-gray-600 mt-2">{h.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'education' && (
                    <div className="space-y-4">
                      {(selected.educationRecords?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No education records yet.</p>}
                      {selected.educationRecords?.map(e => (
                        <div key={e.educationRecordId} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{e.educationLevel} — {e.schoolName}</span>
                            <StatusBadge level={e.completionStatus} />
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div><span className="text-gray-500">Enrollment</span><p className="font-semibold">{e.enrollmentStatus}</p></div>
                            <div><span className="text-gray-500">Attendance</span><p className="font-semibold">{e.attendanceRate}%</p></div>
                            <div>
                              <span className="text-gray-500">Progress</span>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-haven-500 rounded-full" style={{ width: `${e.progressPercent}%` }} />
                                </div>
                                <span className="font-semibold text-xs">{e.progressPercent}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'visits' && (
                    <div className="space-y-4">
                      {(selected.homeVisitations?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No home visits recorded yet.</p>}
                      {selected.homeVisitations?.map(v => (
                        <div key={v.visitationId} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{v.visitType}</span>
                            <span className="text-xs text-gray-500">{v.visitDate}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{v.observations}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-2">
                            <span>Location: {v.locationVisited}</span>
                            <span>Cooperation: {v.familyCooperationLevel}</span>
                            <span>Outcome: {v.visitOutcome}</span>
                          </div>
                          {v.safetyConcernsNoted && <p className="text-xs text-red-600 mt-1 font-medium">Safety concerns noted</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      {(selected.interventionPlans?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No intervention plans yet.</p>}
                      {selected.interventionPlans?.map(p => (
                        <div key={p.planId} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{p.planCategory}</span>
                            <StatusBadge level={p.status} />
                          </div>
                          <p className="text-sm text-gray-700">{p.planDescription}</p>
                          {p.servicesProvided && <p className="text-xs text-gray-500 mt-1">Services: {p.servicesProvided}</p>}
                          {p.targetDate && <p className="text-xs text-gray-500">Target: {p.targetDate}</p>}
                        </div>
                      ))}
                      {(selected.incidentReports?.length ?? 0) > 0 && (
                        <>
                          <h4 className="font-semibold text-sm text-gray-700 mt-6 mb-2">Incident Reports</h4>
                          {selected.incidentReports?.map(ir => (
                            <div key={ir.incidentId} className="border border-red-100 rounded-lg p-4 bg-red-50/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{ir.incidentType}</span>
                                <div className="flex items-center gap-2">
                                  <StatusBadge level={ir.severity} />
                                  {!ir.resolved && <span className="text-xs text-red-600 font-medium">Unresolved</span>}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{ir.description}</p>
                              {ir.responseTaken && <p className="text-xs text-gray-500 mt-1">Response: {ir.responseTaken}</p>}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar — Alerts */}
        <aside className="w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-semibold text-red-800">Alerts ({totalAlerts})</h3>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto divide-y divide-gray-50">
              {alerts?.highRisk.map(a => (
                <button key={`hr-${a.residentId}`} onClick={() => selectResident(a.residentId)} className="w-full text-left px-4 py-3 hover:bg-red-50/50 transition-colors">
                  <p className="text-xs font-medium text-red-700">High Risk</p>
                  <p className="text-sm text-gray-900">{a.internalCode}</p>
                  <p className="text-xs text-gray-500">{a.assignedSocialWorker}</p>
                </button>
              ))}
              {alerts?.flaggedSessions.map(a => (
                <button key={`fs-${a.recordingId}`} onClick={() => selectResident(a.residentId)} className="w-full text-left px-4 py-3 hover:bg-amber-50/50 transition-colors">
                  <p className="text-xs font-medium text-amber-700">Concern Flagged</p>
                  <p className="text-sm text-gray-900">{a.sessionType}</p>
                  <p className="text-xs text-gray-500">{a.sessionDate}</p>
                </button>
              ))}
              {alerts?.unresolvedIncidents.map(a => (
                <button key={`ui-${a.incidentId}`} onClick={() => selectResident(a.residentId)} className="w-full text-left px-4 py-3 hover:bg-orange-50/50 transition-colors">
                  <p className="text-xs font-medium text-orange-700">Unresolved: {a.incidentType}</p>
                  <p className="text-sm text-gray-900">Severity: {a.severity}</p>
                  <p className="text-xs text-gray-500">{a.incidentDate}</p>
                </button>
              ))}
              {totalAlerts === 0 && <p className="px-4 py-6 text-sm text-gray-400 text-center">No active alerts</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
