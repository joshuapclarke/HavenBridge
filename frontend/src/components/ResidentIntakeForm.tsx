import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Resident, User, Safehouse } from '../types/models';

const INPUT = 'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-haven-500 focus:ring-2 focus:ring-haven-500/20 focus:bg-white outline-none transition-all';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1.5';

export const ResidentIntakeForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialWorkers, setSocialWorkers] = useState<User[]>([]);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<Resident>>({
    safehouseId: 0,
    caseControlNo: '',
    sex: 'F',
    dateOfBirth: '',
    birthStatus: '',
    placeOfBirth: '',
    religion: '',
    dateOfAdmission: new Date().toISOString().split('T')[0],
    caseCategory: 'Abandoned',
    initialRiskLevel: 'Medium',
    referralSource: '',
    referringAgencyPerson: '',
    assignedSocialWorker: '',
    caseStatus: 'Active',
    subCatOrphaned: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: false,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4Ps: false,
    familySoloParent: false,
    familyIndigenous: false,
    familyParentPwd: false,
    familyInformalSettler: false,
    reintegrationType: '',
    reintegrationStatus: '',
  });

  useEffect(() => {
    api.users.list()
      .then(users => setSocialWorkers(users.filter(u => u.isSocialWorker)))
      .catch(() => {});
    api.safehouses.list()
      .then(setSafehouses)
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : name === 'safehouseId' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!formData.safehouseId) {
      setError('Please select a safehouse.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.residents.create({ ...formData, currentRiskLevel: formData.initialRiskLevel });
      setSuccess(true);
      setTimeout(() => navigate('/cases'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create resident case record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm px-4 py-3" role="alert">{error}</div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3" role="status">
          Resident intake saved successfully! Redirecting...
        </div>
      )}

      {/* Core Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Core Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL}>Case Control No. *</label>
              <input required type="text" name="caseControlNo" value={formData.caseControlNo} onChange={handleChange} className={INPUT} placeholder="e.g., C0073" />
            </div>
            <div>
              <label className={LABEL}>Safehouse *</label>
              <select required name="safehouseId" value={formData.safehouseId} onChange={handleChange} className={INPUT}>
                <option value={0} disabled>Select a safehouse...</option>
                {safehouses.map(sh => (
                  <option key={sh.safehouseId} value={sh.safehouseId}>{sh.name} — {sh.city ?? sh.region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Sex</label>
              <select name="sex" value={formData.sex} onChange={handleChange} className={INPUT}>
                <option value="F">Female</option><option value="M">Male</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Date of Birth *</label>
              <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Birth Status</label>
              <select name="birthStatus" value={formData.birthStatus} onChange={handleChange} className={INPUT}>
                <option value="">Select...</option><option>Marital</option><option>Non-Marital</option><option>Unknown</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Place of Birth</label>
              <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className={INPUT} placeholder="e.g., Quezon City" />
            </div>
            <div>
              <label className={LABEL}>Religion</label>
              <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={INPUT} placeholder="e.g., Roman Catholic" />
            </div>
            <div>
              <label className={LABEL}>Date of Admission *</label>
              <input required type="date" name="dateOfAdmission" value={formData.dateOfAdmission} onChange={handleChange} className={INPUT} />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Assigned Social Worker *</label>
              <select required name="assignedSocialWorker" value={formData.assignedSocialWorker} onChange={handleChange} className={INPUT}>
                <option value="">Select a social worker...</option>
                {socialWorkers.map(w => (
                  <option key={w.userId} value={`${w.userFirstName} ${w.userLastName}`}>
                    {w.userFirstName} {w.userLastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Case Assessment */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Case Assessment</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>Case Category</label>
              <select name="caseCategory" value={formData.caseCategory} onChange={handleChange} className={INPUT}>
                <option value="Abandoned">Abandoned</option>
                <option value="Foundling">Foundling</option>
                <option value="Surrendered">Surrendered</option>
                <option value="Neglected">Neglected</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Initial Risk Level</label>
              <select name="initialRiskLevel" value={formData.initialRiskLevel} onChange={handleChange} className={INPUT}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Referral Source</label>
              <select name="referralSource" value={formData.referralSource} onChange={handleChange} className={INPUT}>
                <option value="">Select...</option>
                <option value="Government Agency">Government Agency</option>
                <option value="NGO">NGO</option>
                <option value="Police">Police</option>
                <option value="Self-Referral">Self-Referral</option>
                <option value="Community">Community</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Vulnerability Sub-Categories</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/80 rounded-2xl border border-gray-100 p-5">
              {[
                { name: 'subCatOrphaned', label: 'Orphaned' },
                { name: 'subCatPhysicalAbuse', label: 'Physical Abuse' },
                { name: 'subCatSexualAbuse', label: 'Sexual Abuse' },
                { name: 'subCatTrafficked', label: 'Trafficked' },
                { name: 'subCatChildLabor', label: 'Child Labor' },
                { name: 'subCatOsaec', label: 'OSAEC' },
                { name: 'subCatCicl', label: 'CICL' },
                { name: 'subCatAtRisk', label: 'At Risk' },
                { name: 'subCatStreetChild', label: 'Street Child' },
                { name: 'subCatChildWithHiv', label: 'Child with HIV' },
              ].map(cat => (
                <label key={cat.name} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name={cat.name} checked={(formData as any)[cat.name] ?? false} onChange={handleChange} className="rounded border-gray-300 text-haven-600 focus:ring-haven-500" />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL}>Referring Agency / Person</label>
            <input type="text" name="referringAgencyPerson" value={formData.referringAgencyPerson} onChange={handleChange} className={INPUT} placeholder="e.g., Ana Cruz" />
          </div>
        </div>
      </div>

      {/* Disability & Special Needs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Disability & Special Needs</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="isPwd" checked={formData.isPwd ?? false} onChange={handleChange} className="rounded border-gray-300 text-haven-600 focus:ring-haven-500" />
              Person with Disability (PWD)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="hasSpecialNeeds" checked={formData.hasSpecialNeeds ?? false} onChange={handleChange} className="rounded border-gray-300 text-haven-600 focus:ring-haven-500" />
              Has Special Needs
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL}>PWD Type</label>
              <input type="text" name="pwdType" value={formData.pwdType} onChange={handleChange} className={INPUT} placeholder="e.g., Physical, Visual, Hearing" />
            </div>
            <div>
              <label className={LABEL}>Special Needs Diagnosis</label>
              <input type="text" name="specialNeedsDiagnosis" value={formData.specialNeedsDiagnosis} onChange={handleChange} className={INPUT} placeholder="e.g., Speech Impairment" />
            </div>
          </div>
        </div>
      </div>

      {/* Family Socio-Demographic Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Family Socio-Demographic Profile</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50/80 rounded-2xl border border-gray-100 p-5">
            {[
              { name: 'familyIs4Ps', label: '4Ps Beneficiary' },
              { name: 'familySoloParent', label: 'Solo Parent' },
              { name: 'familyIndigenous', label: 'Indigenous Group' },
              { name: 'familyParentPwd', label: 'Parent is PWD' },
              { name: 'familyInformalSettler', label: 'Informal Settler' },
            ].map(f => (
              <label key={f.name} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name={f.name} checked={(formData as any)[f.name] ?? false} onChange={handleChange} className="rounded border-gray-300 text-haven-600 focus:ring-haven-500" />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Reintegration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Reintegration</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL}>Reintegration Type</label>
              <select name="reintegrationType" value={formData.reintegrationType} onChange={handleChange} className={INPUT}>
                <option value="">Select...</option><option>Family Reunification</option><option>Foster Care</option><option>Independent Living</option><option>Adoption</option><option>None</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Reintegration Status</label>
              <select name="reintegrationStatus" value={formData.reintegrationStatus} onChange={handleChange} className={INPUT}>
                <option value="">Select...</option><option>Not Started</option><option>In Progress</option><option>On Hold</option><option>Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/cases')}
          className="px-5 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-haven-600 to-haven-700 rounded-xl hover:from-haven-700 hover:to-haven-800 focus:outline-none focus:ring-2 focus:ring-haven-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save Intake Record'}
        </button>
      </div>
    </form>
  );
};
