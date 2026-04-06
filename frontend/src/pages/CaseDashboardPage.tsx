import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import type { Resident, AlertsData } from '../types/models';
import { ExclamationTriangleIcon, MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/solid';

type Tab = 'sessions' | 'health' | 'education' | 'visits' | 'notes';

export default function CaseDashboardPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selected, setSelected] = useState<Resident | null>(null);
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  useEffect(() => {
    Promise.all([api.residents.list(), api.residents.alerts()])
      .then(([r, a]) => { setResidents(r); setAlerts(a); })
      .finally(() => setLoading(false));
  }, []);

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ sessionType: 'Individual', sessionDurationMinutes: 60, emotionalStateObserved: '', emotionalStateEnd: '', sessionNarrative: '', interventionsApplied: '', followUpActions: '' });
  const [visitForm, setVisitForm] = useState({ visitType: 'Routine Follow-Up', locationVisited: '', purpose: '', observations: '', familyCooperationLevel: 'Cooperative' });

  const handleAddSession = async () => {
    if (!selected) return;
    await api.sessions.create({
      residentId: selected.residentId,
      sessionDate: new Date().toISOString().split('T')[0],
      socialWorker: selected.assignedSocialWorker,
      ...sessionForm,
      progressNoted: false,
      concernsFlagged: false,
      referralMade: false,
    });
    const detail = await api.residents.get(selected.residentId);
    setSelected(detail);
    setShowSessionForm(false);
    setSessionForm({ sessionType: 'Individual', sessionDurationMinutes: 60, emotionalStateObserved: '', emotionalStateEnd: '', sessionNarrative: '', interventionsApplied: '', followUpActions: '' });
  };

  const handleAddVisit = async () => {
    if (!selected) return;
    await api.visits.create({
      residentId: selected.residentId,
      visitDate: new Date().toISOString().split('T')[0],
      socialWorker: selected.assignedSocialWorker,
      ...visitForm,
      safetyConcernsNoted: false,
      followUpNeeded: false,
      visitOutcome: 'Favorable',
    });
    const detail = await api.residents.get(selected.residentId);
    setSelected(detail);
    setShowVisitForm(false);
    setVisitForm({ visitType: 'Routine Follow-Up', locationVisited: '', purpose: '', observations: '', familyCooperationLevel: 'Cooperative' });
  };

  const filteredResidents = useMemo(() => {
    let filtered = residents;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.internalCode?.toLowerCase().includes(q) ||
        r.caseControlNo?.toLowerCase().includes(q) ||
        r.assignedSocialWorker?.toLowerCase().includes(q) ||
        r.caseCategory?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(r => r.caseStatus === statusFilter);
    }
    if (riskFilter) {
      filtered = filtered.filter(r => r.currentRiskLevel === riskFilter);
    }
    return filtered;
  }, [residents, searchTerm, statusFilter, riskFilter]);

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
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Resident Cases</h1>
        <p className="text-gray-500 mt-2 text-base">View and manage all resident cases, sessions, and records.</p>
      </div>

      <div className="flex gap-6">
        <aside className="w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3.5 bg-gray-50/80 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-semibold text-gray-700">Residents ({filteredResidents.length})</h3>
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search code, worker, category..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                  <option value="Transferred">Transferred</option>
                </select>
                <select
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value)}
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none"
                >
                  <option value="">All Risk</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <ul className="divide-y divide-gray-50 max-h-[calc(100vh-340px)] overflow-y-auto">
              {filteredResidents.map(r => (
                <li key={r.residentId}>
                  <button
                    onClick={() => selectResident(r.residentId)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all ${
                      selected?.residentId === r.residentId ? 'bg-haven-50' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ring-3 ring-opacity-20 ${riskDot(r.currentRiskLevel)} ring-${r.currentRiskLevel === 'High' ? 'red' : r.currentRiskLevel === 'Medium' ? 'amber' : 'emerald'}-500`} />
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-96 text-gray-400">
              Select a resident from the list to view their case.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">{selected.internalCode}</h2>
                      <StatusBadge level={selected.currentRiskLevel} size="md" />
                      <StatusBadge level={selected.caseStatus} size="md" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5">
                      {selected.caseCategory} &middot; Case {selected.caseControlNo} &middot; {selected.safehouse?.name}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 space-y-0.5">
                    <p>Age: <span className="font-medium text-gray-900">{selected.presentAge}</span></p>
                    <p>Admitted: <span className="font-medium text-gray-900">{selected.dateOfAdmission}</span></p>
                    <p>Worker: <span className="font-medium text-gray-900">{selected.assignedSocialWorker}</span></p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 px-6">
                  <nav className="flex gap-6 -mb-px">
                    {tabs.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`py-3.5 text-sm font-medium border-b-2 transition-all ${
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
                      <div className="flex justify-end">
                        <button onClick={() => setShowSessionForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-haven-600 text-white text-xs font-medium rounded-xl hover:bg-haven-700 transition-all shadow-sm hover:shadow-md">
                          <PlusIcon className="h-4 w-4" /> Add Session
                        </button>
                      </div>
                      {(selected.processRecordings?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No sessions recorded yet.</p>}
                      {selected.processRecordings?.map(s => (
                        <div key={s.recordingId} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{s.sessionType}</span>
                              {s.concernsFlagged && <span className="text-xs bg-red-50 text-red-700 px-2.5 py-0.5 rounded-lg font-medium">Concern</span>}
                              {s.progressNoted && <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg font-medium">Progress</span>}
                            </div>
                            <span className="text-xs text-gray-500">{s.sessionDate} &middot; {s.sessionDurationMinutes} min</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{s.sessionNarrative}</p>
                          {s.followUpActions && <p className="text-xs text-gray-500 mt-2">Follow-up: {s.followUpActions}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'health' && (
                    <div className="space-y-4">
                      {(selected.healthRecords?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No health records yet.</p>}
                      {selected.healthRecords?.map(h => (
                        <div key={h.healthRecordId} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors">
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
                        <div key={e.educationRecordId} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{e.educationLevel} — {e.schoolName}</span>
                            <StatusBadge level={e.completionStatus} />
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div><span className="text-gray-500">Enrollment</span><p className="font-semibold">{e.enrollmentStatus}</p></div>
                            <div><span className="text-gray-500">Attendance</span><p className="font-semibold tabular-nums">{e.attendanceRate}%</p></div>
                            <div>
                              <span className="text-gray-500">Progress</span>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-haven-500 rounded-full transition-all" style={{ width: `${e.progressPercent}%` }} />
                                </div>
                                <span className="font-semibold text-xs tabular-nums">{e.progressPercent}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'visits' && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <button onClick={() => setShowVisitForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-haven-600 text-white text-xs font-medium rounded-xl hover:bg-haven-700 transition-all shadow-sm hover:shadow-md">
                          <PlusIcon className="h-4 w-4" /> Add Visit
                        </button>
                      </div>
                      {(selected.homeVisitations?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No home visits recorded yet.</p>}
                      {selected.homeVisitations?.map(v => (
                        <div key={v.visitationId} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{v.visitType}</span>
                            <span className="text-xs text-gray-500">{v.visitDate}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mb-1">{v.observations}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-2">
                            <span>Location: {v.locationVisited}</span>
                            <span>Cooperation: {v.familyCooperationLevel}</span>
                            <span>Outcome: {v.visitOutcome}</span>
                          </div>
                          {v.safetyConcernsNoted && <p className="text-xs text-red-600 mt-1.5 font-medium">Safety concerns noted</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      {(selected.interventionPlans?.length ?? 0) === 0 && <p className="text-gray-400 text-sm">No intervention plans yet.</p>}
                      {selected.interventionPlans?.map(p => (
                        <div key={p.planId} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{p.planCategory}</span>
                            <StatusBadge level={p.status} />
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{p.planDescription}</p>
                          {p.servicesProvided && <p className="text-xs text-gray-500 mt-1">Services: {p.servicesProvided}</p>}
                          {p.targetDate && <p className="text-xs text-gray-500">Target: {p.targetDate}</p>}
                        </div>
                      ))}
                      {(selected.incidentReports?.length ?? 0) > 0 && (
                        <>
                          <h4 className="font-semibold text-sm text-gray-700 mt-6 mb-2">Incident Reports</h4>
                          {selected.incidentReports?.map(ir => (
                            <div key={ir.incidentId} className="border border-red-100 rounded-2xl p-5 bg-red-50/30">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{ir.incidentType}</span>
                                <div className="flex items-center gap-2">
                                  <StatusBadge level={ir.severity} />
                                  {!ir.resolved && <span className="text-xs text-red-600 font-medium">Unresolved</span>}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{ir.description}</p>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3.5 bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-100 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-semibold text-red-800">Alerts ({totalAlerts})</h3>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto divide-y divide-gray-50">
              {alerts?.highRisk.map(a => (
                <button key={`hr-${a.residentId}`} onClick={() => selectResident(a.residentId)} className="w-full text-left px-4 py-3.5 hover:bg-red-50/50 transition-colors">
                  <p className="text-xs font-medium text-red-700">High Risk</p>
                  <p className="text-sm text-gray-900 font-medium">{a.internalCode}</p>
                  <p className="text-xs text-gray-500">{a.assignedSocialWorker}</p>
                </button>
              ))}
              {alerts?.flaggedSessions.map(a => (
                <button key={`fs-${a.recordingId}`} onClick={() => selectResident(a.residentId)} className="w-full text-left px-4 py-3.5 hover:bg-amber-50/50 transition-colors">
                  <p className="text-xs font-medium text-amber-700">Concern Flagged</p>
                  <p className="text-sm text-gray-900 font-medium">{a.sessionType}</p>
                  <p className="text-xs text-gray-500">{a.sessionDate}</p>
                </button>
              ))}
              {alerts?.unresolvedIncidents.map(a => (
                <button key={`ui-${a.incidentId}`} onClick={() => selectResident(a.residentId)} className="w-full text-left px-4 py-3.5 hover:bg-orange-50/50 transition-colors">
                  <p className="text-xs font-medium text-orange-700">Unresolved: {a.incidentType}</p>
                  <p className="text-sm text-gray-900 font-medium">Severity: {a.severity}</p>
                  <p className="text-xs text-gray-500">{a.incidentDate}</p>
                </button>
              ))}
              {totalAlerts === 0 && <p className="px-4 py-8 text-sm text-gray-400 text-center">No active alerts</p>}
            </div>
          </div>
        </aside>
      </div>

      <Modal open={showSessionForm} onClose={() => setShowSessionForm(false)} title="Add Counseling Session">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Type</label>
            <select value={sessionForm.sessionType} onChange={e => setSessionForm(f => ({ ...f, sessionType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
              <option>Individual</option><option>Group</option><option>Family</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (min)</label>
            <input type="number" value={sessionForm.sessionDurationMinutes} onChange={e => setSessionForm(f => ({ ...f, sessionDurationMinutes: +e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Emotional Start</label>
              <select value={sessionForm.emotionalStateObserved} onChange={e => setSessionForm(f => ({ ...f, emotionalStateObserved: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
                <option value="">Select...</option><option>Calm</option><option>Anxious</option><option>Sad</option><option>Angry</option><option>Hopeful</option><option>Distressed</option><option>Withdrawn</option><option>Happy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Emotional End</label>
              <select value={sessionForm.emotionalStateEnd} onChange={e => setSessionForm(f => ({ ...f, emotionalStateEnd: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
                <option value="">Select...</option><option>Calm</option><option>Anxious</option><option>Sad</option><option>Angry</option><option>Hopeful</option><option>Distressed</option><option>Withdrawn</option><option>Happy</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Narrative</label>
            <textarea rows={3} value={sessionForm.sessionNarrative} onChange={e => setSessionForm(f => ({ ...f, sessionNarrative: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Interventions Applied</label>
            <input value={sessionForm.interventionsApplied} onChange={e => setSessionForm(f => ({ ...f, interventionsApplied: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="e.g. Healing, Teaching" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Follow-Up Actions</label>
            <input value={sessionForm.followUpActions} onChange={e => setSessionForm(f => ({ ...f, followUpActions: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowSessionForm(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={handleAddSession} className="px-4 py-2.5 text-sm font-medium text-white bg-haven-600 rounded-xl hover:bg-haven-700 transition-all shadow-sm">Save Session</button>
          </div>
        </div>
      </Modal>

      <Modal open={showVisitForm} onClose={() => setShowVisitForm(false)} title="Add Home Visit">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visit Type</label>
            <select value={visitForm.visitType} onChange={e => setVisitForm(f => ({ ...f, visitType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
              <option>Routine Follow-Up</option><option>Reintegration Assessment</option><option>Post-Placement Monitoring</option><option>Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Visited</label>
            <input value={visitForm.locationVisited} onChange={e => setVisitForm(f => ({ ...f, locationVisited: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" placeholder="e.g. Family Home" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
            <input value={visitForm.purpose} onChange={e => setVisitForm(f => ({ ...f, purpose: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Observations</label>
            <textarea rows={3} value={visitForm.observations} onChange={e => setVisitForm(f => ({ ...f, observations: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Family Cooperation</label>
            <select value={visitForm.familyCooperationLevel} onChange={e => setVisitForm(f => ({ ...f, familyCooperationLevel: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-haven-500/20 focus:border-haven-500 outline-none transition-all">
              <option>Highly Cooperative</option><option>Cooperative</option><option>Neutral</option><option>Uncooperative</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowVisitForm(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={handleAddVisit} className="px-4 py-2.5 text-sm font-medium text-white bg-haven-600 rounded-xl hover:bg-haven-700 transition-all shadow-sm">Save Visit</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
