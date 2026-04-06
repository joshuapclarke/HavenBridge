export interface Safehouse {
  safehouseId: number;
  safehouseCode: string;
  name: string;
  region?: string;
  city?: string;
  province?: string;
  country?: string;
  openDate?: string;
  status: string;
  capacityGirls: number;
  capacityStaff: number;
  currentOccupancy: number;
  notes?: string;
  residents?: Resident[];
}

export interface Resident {
  residentId: number;
  safehouseId: number;
  caseControlNo?: string;
  internalCode?: string;
  caseStatus: string;
  sex?: string;
  dateOfBirth?: string;
  caseCategory?: string;
  subCatOrphaned: boolean;
  subCatTrafficked: boolean;
  subCatChildLabor: boolean;
  subCatPhysicalAbuse: boolean;
  subCatSexualAbuse: boolean;
  subCatOsaec: boolean;
  subCatCicl: boolean;
  subCatAtRisk: boolean;
  subCatStreetChild: boolean;
  subCatChildWithHiv: boolean;
  referralSource?: string;
  assignedSocialWorker?: string;
  initialRiskLevel?: string;
  currentRiskLevel?: string;
  ageUponAdmission?: string;
  presentAge?: string;
  dateOfAdmission?: string;
  createdAt: string;
  safehouse?: Safehouse;
  processRecordings?: ProcessRecording[];
  interventionPlans?: InterventionPlan[];
  homeVisitations?: HomeVisitation[];
  healthRecords?: HealthWellbeingRecord[];
  educationRecords?: EducationRecord[];
  incidentReports?: IncidentReport[];
}

export interface ProcessRecording {
  recordingId: number;
  residentId: number;
  sessionDate: string;
  socialWorker?: string;
  sessionType?: string;
  sessionDurationMinutes: number;
  emotionalStateObserved?: string;
  emotionalStateEnd?: string;
  sessionNarrative?: string;
  interventionsApplied?: string;
  followUpActions?: string;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
}

export interface InterventionPlan {
  planId: number;
  residentId: number;
  planCategory?: string;
  planDescription?: string;
  servicesProvided?: string;
  targetValue?: number;
  targetDate?: string;
  status: string;
  caseConferenceDate?: string;
}

export interface HomeVisitation {
  visitationId: number;
  residentId: number;
  visitDate: string;
  socialWorker?: string;
  visitType?: string;
  locationVisited?: string;
  familyMembersPresent?: string;
  purpose?: string;
  observations?: string;
  familyCooperationLevel?: string;
  safetyConcernsNoted: boolean;
  followUpNeeded: boolean;
  followUpNotes?: string;
  visitOutcome?: string;
}

export interface HealthWellbeingRecord {
  healthRecordId: number;
  residentId: number;
  recordDate: string;
  generalHealthScore?: number;
  nutritionScore?: number;
  sleepQualityScore?: number;
  energyLevelScore?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  medicalCheckupDone: boolean;
  dentalCheckupDone: boolean;
  psychologicalCheckupDone: boolean;
  notes?: string;
}

export interface EducationRecord {
  educationRecordId: number;
  residentId: number;
  recordDate: string;
  educationLevel?: string;
  schoolName?: string;
  enrollmentStatus?: string;
  attendanceRate?: number;
  progressPercent?: number;
  completionStatus?: string;
  notes?: string;
}

export interface IncidentReport {
  incidentId: number;
  residentId: number;
  safehouseId: number;
  incidentDate: string;
  incidentType?: string;
  severity?: string;
  description?: string;
  responseTaken?: string;
  resolved: boolean;
  resolutionDate?: string;
  reportedBy?: string;
  followUpRequired: boolean;
}

export interface Supporter {
  supporterId: number;
  supporterType?: string;
  displayName: string;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  relationshipType?: string;
  region?: string;
  country?: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  firstDonationDate?: string;
  acquisitionChannel?: string;
  donations?: Donation[];
}

export interface Donation {
  donationId: number;
  supporterId: number;
  donationType?: string;
  donationDate: string;
  isRecurring: boolean;
  campaignName?: string;
  channelSource?: string;
  currencyCode: string;
  amount: number;
  estimatedValue?: number;
  impactUnit?: string;
  notes?: string;
  supporter?: Supporter;
  allocations?: DonationAllocation[];
}

export interface DonationAllocation {
  allocationId: number;
  donationId: number;
  safehouseId: number;
  programArea?: string;
  amountAllocated: number;
  allocationDate?: string;
  allocationNotes?: string;
  safehouse?: Safehouse;
}

export interface SupporterSummary {
  total: number;
  active: number;
  atRisk: number;
  avgGift: number;
}

export interface AlertsData {
  highRisk: { residentId: number; internalCode: string; currentRiskLevel: string; assignedSocialWorker: string; type: string }[];
  flaggedSessions: { recordingId: number; residentId: number; sessionDate: string; sessionType: string; type: string }[];
  unresolvedIncidents: { incidentId: number; residentId: number; incidentDate: string; severity: string; incidentType: string; type: string }[];
}

export interface RecentActivity {
  type: string;
  date: string;
  description: string;
  socialWorker: string;
}

export interface ImpactOverview {
  totalResidents: number;
  totalSessions: number;
  totalDonations: number;
  activeSafehouses: number;
}

export interface DonorImpact {
  totalGiven: number;
  donationCount: number;
  allocations: { programArea: string; amountAllocated: number; safehouseName: string }[];
  campaigns: string[];
}

export interface PublicImpactSnapshot {
  snapshotId: number;
  snapshotDate: string;
  headline?: string;
  summaryText?: string;
  metricPayloadJson?: string;
  isPublished: boolean;
}
