using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Data;

public class HavenBridgeContext : DbContext
{
    public HavenBridgeContext(DbContextOptions<HavenBridgeContext> options) : base(options) { }

    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<ProcessRecording> ProcessRecordings => Set<ProcessRecording>();
    public DbSet<InterventionPlan> InterventionPlans => Set<InterventionPlan>();
    public DbSet<HomeVisitation> HomeVisitations => Set<HomeVisitation>();
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords => Set<HealthWellbeingRecord>();
    public DbSet<EducationRecord> EducationRecords => Set<EducationRecord>();
    public DbSet<IncidentReport> IncidentReports => Set<IncidentReport>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();
    public DbSet<InKindDonationItem> InKindDonationItems => Set<InKindDonationItem>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PartnerAssignment> PartnerAssignments => Set<PartnerAssignment>();
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics => Set<SafehouseMonthlyMetric>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<IncidentReport>()
            .HasOne(ir => ir.Resident)
            .WithMany(r => r.IncidentReports)
            .HasForeignKey(ir => ir.ResidentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<IncidentReport>()
            .HasOne(ir => ir.Safehouse)
            .WithMany(s => s.IncidentReports)
            .HasForeignKey(ir => ir.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DonationAllocation>()
            .HasOne(da => da.Safehouse)
            .WithMany(s => s.DonationAllocations)
            .HasForeignKey(da => da.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Safehouse>().HasData(
            new Safehouse { SafehouseId = 1, SafehouseCode = "SH-001", Name = "Haven House Manila", Region = "NCR", City = "Manila", Province = "Metro Manila", Country = "Philippines", OpenDate = new DateOnly(2020, 3, 15), Status = "Active", CapacityGirls = 20, CapacityStaff = 8, CurrentOccupancy = 14 },
            new Safehouse { SafehouseId = 2, SafehouseCode = "SH-002", Name = "Bridge Home Cebu", Region = "VII", City = "Cebu City", Province = "Cebu", Country = "Philippines", OpenDate = new DateOnly(2021, 7, 1), Status = "Active", CapacityGirls = 15, CapacityStaff = 6, CurrentOccupancy = 11 }
        );

        modelBuilder.Entity<Resident>().HasData(
            new Resident { ResidentId = 1, SafehouseId = 1, CaseControlNo = "CC-2024-001", InternalCode = "R001", CaseStatus = "Active", Sex = "Female", DateOfBirth = new DateOnly(2012, 5, 10), CaseCategory = "Protection", SubCatPhysicalAbuse = true, SubCatAtRisk = true, ReferralSource = "DSWD", AssignedSocialWorker = "Maria Santos", InitialRiskLevel = "High", CurrentRiskLevel = "Medium", AgeUponAdmission = "11", PresentAge = "14", DateOfAdmission = new DateOnly(2024, 1, 15), CreatedAt = new DateTime(2024, 1, 15, 8, 0, 0, DateTimeKind.Utc) },
            new Resident { ResidentId = 2, SafehouseId = 1, CaseControlNo = "CC-2024-002", InternalCode = "R002", CaseStatus = "Active", Sex = "Female", DateOfBirth = new DateOnly(2010, 11, 22), CaseCategory = "Trafficking", SubCatTrafficked = true, ReferralSource = "PNP-WCPC", AssignedSocialWorker = "Maria Santos", InitialRiskLevel = "High", CurrentRiskLevel = "High", AgeUponAdmission = "13", PresentAge = "15", DateOfAdmission = new DateOnly(2024, 3, 5), CreatedAt = new DateTime(2024, 3, 5, 8, 0, 0, DateTimeKind.Utc) },
            new Resident { ResidentId = 3, SafehouseId = 1, CaseControlNo = "CC-2024-003", InternalCode = "R003", CaseStatus = "Active", Sex = "Female", DateOfBirth = new DateOnly(2013, 8, 3), CaseCategory = "Neglect", SubCatOrphaned = true, ReferralSource = "Barangay LGU", AssignedSocialWorker = "Bea Reyes", InitialRiskLevel = "Medium", CurrentRiskLevel = "Low", AgeUponAdmission = "10", PresentAge = "12", DateOfAdmission = new DateOnly(2024, 6, 20), CreatedAt = new DateTime(2024, 6, 20, 8, 0, 0, DateTimeKind.Utc) },
            new Resident { ResidentId = 4, SafehouseId = 2, CaseControlNo = "CC-2024-004", InternalCode = "R004", CaseStatus = "Active", Sex = "Female", DateOfBirth = new DateOnly(2011, 2, 14), CaseCategory = "OSAEC", SubCatOsaec = true, SubCatSexualAbuse = true, ReferralSource = "IJM", AssignedSocialWorker = "Ana Cruz", InitialRiskLevel = "High", CurrentRiskLevel = "Medium", AgeUponAdmission = "12", PresentAge = "15", DateOfAdmission = new DateOnly(2024, 2, 10), CreatedAt = new DateTime(2024, 2, 10, 8, 0, 0, DateTimeKind.Utc) },
            new Resident { ResidentId = 5, SafehouseId = 2, CaseControlNo = "CC-2025-001", InternalCode = "R005", CaseStatus = "Active", Sex = "Female", DateOfBirth = new DateOnly(2014, 6, 30), CaseCategory = "Child Labor", SubCatChildLabor = true, SubCatStreetChild = true, ReferralSource = "NGO Partner", AssignedSocialWorker = "Ana Cruz", InitialRiskLevel = "Medium", CurrentRiskLevel = "Low", AgeUponAdmission = "10", PresentAge = "11", DateOfAdmission = new DateOnly(2025, 1, 8), CreatedAt = new DateTime(2025, 1, 8, 8, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<ProcessRecording>().HasData(
            new ProcessRecording { RecordingId = 1, ResidentId = 1, SessionDate = new DateOnly(2025, 3, 1), SocialWorker = "Maria Santos", SessionType = "Individual Counseling", SessionDurationMinutes = 60, EmotionalStateObserved = "Anxious", EmotionalStateEnd = "Calm", SessionNarrative = "Resident discussed feelings about family situation. Showed willingness to engage.", InterventionsApplied = "CBT techniques, active listening", FollowUpActions = "Schedule follow-up in 1 week", ProgressNoted = true },
            new ProcessRecording { RecordingId = 2, ResidentId = 1, SessionDate = new DateOnly(2025, 3, 15), SocialWorker = "Maria Santos", SessionType = "Group Therapy", SessionDurationMinutes = 90, EmotionalStateObserved = "Quiet", EmotionalStateEnd = "Engaged", SessionNarrative = "Participated in group art therapy. Opened up about trust issues.", InterventionsApplied = "Art therapy, group discussion", ProgressNoted = true },
            new ProcessRecording { RecordingId = 3, ResidentId = 2, SessionDate = new DateOnly(2025, 3, 10), SocialWorker = "Maria Santos", SessionType = "Trauma-Focused Therapy", SessionDurationMinutes = 45, EmotionalStateObserved = "Withdrawn", EmotionalStateEnd = "Slightly more open", SessionNarrative = "Initial trauma assessment session. Resident has difficulty with trust.", InterventionsApplied = "TF-CBT phase 1", FollowUpActions = "Continue stabilization before narrative", ConcernsFlagged = true },
            new ProcessRecording { RecordingId = 4, ResidentId = 4, SessionDate = new DateOnly(2025, 3, 5), SocialWorker = "Ana Cruz", SessionType = "Individual Counseling", SessionDurationMinutes = 55, EmotionalStateObserved = "Sad", EmotionalStateEnd = "Hopeful", SessionNarrative = "Discussed progress in school and future goals.", InterventionsApplied = "Solution-focused brief therapy", ProgressNoted = true }
        );

        modelBuilder.Entity<HomeVisitation>().HasData(
            new HomeVisitation { VisitationId = 1, ResidentId = 1, VisitDate = new DateOnly(2025, 2, 20), SocialWorker = "Maria Santos", VisitType = "Family Assessment", LocationVisited = "Tondo, Manila", FamilyMembersPresent = "Mother, Grandmother", Purpose = "Assess family readiness for reintegration", Observations = "Home is clean but crowded. Mother expresses desire to reunite.", FamilyCooperationLevel = "High", SafetyConcernsNoted = false, FollowUpNeeded = true, FollowUpNotes = "Schedule follow-up to verify income stability", VisitOutcome = "Positive" },
            new HomeVisitation { VisitationId = 2, ResidentId = 3, VisitDate = new DateOnly(2025, 3, 12), SocialWorker = "Bea Reyes", VisitType = "Regular Monitoring", LocationVisited = "Sampaloc, Manila", FamilyMembersPresent = "Aunt", Purpose = "Check on extended family support", Observations = "Aunt has limited resources but is willing to support.", FamilyCooperationLevel = "Medium", SafetyConcernsNoted = false, FollowUpNeeded = true, VisitOutcome = "Needs further assessment" }
        );

        modelBuilder.Entity<HealthWellbeingRecord>().HasData(
            new HealthWellbeingRecord { HealthRecordId = 1, ResidentId = 1, RecordDate = new DateOnly(2025, 3, 1), GeneralHealthScore = 7.5f, NutritionScore = 8f, SleepQualityScore = 6f, EnergyLevelScore = 7f, HeightCm = 148, WeightKg = 38, Bmi = 17.3f, MedicalCheckupDone = true, DentalCheckupDone = true, PsychologicalCheckupDone = true },
            new HealthWellbeingRecord { HealthRecordId = 2, ResidentId = 2, RecordDate = new DateOnly(2025, 3, 1), GeneralHealthScore = 6f, NutritionScore = 5.5f, SleepQualityScore = 4f, EnergyLevelScore = 5f, HeightCm = 155, WeightKg = 42, Bmi = 17.5f, MedicalCheckupDone = true, PsychologicalCheckupDone = true, Notes = "Sleep disturbances reported — nightmares." },
            new HealthWellbeingRecord { HealthRecordId = 3, ResidentId = 4, RecordDate = new DateOnly(2025, 3, 1), GeneralHealthScore = 8f, NutritionScore = 8.5f, SleepQualityScore = 7f, EnergyLevelScore = 8f, HeightCm = 152, WeightKg = 41, Bmi = 17.7f, MedicalCheckupDone = true, DentalCheckupDone = true, PsychologicalCheckupDone = true }
        );

        modelBuilder.Entity<EducationRecord>().HasData(
            new EducationRecord { EducationRecordId = 1, ResidentId = 1, RecordDate = new DateOnly(2025, 3, 1), EducationLevel = "Grade 8", SchoolName = "Alternative Learning System", EnrollmentStatus = "Enrolled", AttendanceRate = 92f, ProgressPercent = 78f, CompletionStatus = "In Progress" },
            new EducationRecord { EducationRecordId = 2, ResidentId = 3, RecordDate = new DateOnly(2025, 3, 1), EducationLevel = "Grade 6", SchoolName = "HavenBridge Tutorial Program", EnrollmentStatus = "Enrolled", AttendanceRate = 95f, ProgressPercent = 85f, CompletionStatus = "In Progress" },
            new EducationRecord { EducationRecordId = 3, ResidentId = 4, RecordDate = new DateOnly(2025, 3, 1), EducationLevel = "Grade 9", SchoolName = "Cebu City National HS (ALS Track)", EnrollmentStatus = "Enrolled", AttendanceRate = 88f, ProgressPercent = 70f, CompletionStatus = "In Progress" }
        );

        modelBuilder.Entity<IncidentReport>().HasData(
            new IncidentReport { IncidentId = 1, ResidentId = 2, SafehouseId = 1, IncidentDate = new DateOnly(2025, 2, 28), IncidentType = "Behavioral", Severity = "Medium", Description = "Resident had a verbal altercation with another resident during dinner.", ResponseTaken = "Counselor intervened, both residents separated and counseled.", Resolved = true, ResolutionDate = new DateOnly(2025, 3, 1), ReportedBy = "Night Staff" },
            new IncidentReport { IncidentId = 2, ResidentId = 4, SafehouseId = 2, IncidentDate = new DateOnly(2025, 3, 18), IncidentType = "Health", Severity = "Low", Description = "Resident complained of recurring headaches.", ResponseTaken = "Referred to partner clinic for examination.", Resolved = false, ReportedBy = "Ana Cruz", FollowUpRequired = true }
        );

        modelBuilder.Entity<Supporter>().HasData(
            new Supporter { SupporterId = 1, SupporterType = "Individual", DisplayName = "John Chen", FirstName = "John", LastName = "Chen", RelationshipType = "Monthly Donor", Country = "United States", Email = "john.chen@example.com", Status = "Active", CreatedAt = new DateTime(2023, 6, 1, 0, 0, 0, DateTimeKind.Utc), FirstDonationDate = new DateOnly(2023, 6, 15), AcquisitionChannel = "Website" },
            new Supporter { SupporterId = 2, SupporterType = "Organization", DisplayName = "Grace Foundation", OrganizationName = "Grace Foundation", RelationshipType = "Corporate Partner", Country = "Philippines", Email = "grants@gracefound.org", Status = "Active", CreatedAt = new DateTime(2022, 1, 10, 0, 0, 0, DateTimeKind.Utc), FirstDonationDate = new DateOnly(2022, 2, 1), AcquisitionChannel = "Referral" },
            new Supporter { SupporterId = 3, SupporterType = "Individual", DisplayName = "Sarah Miller", FirstName = "Sarah", LastName = "Miller", RelationshipType = "One-Time Donor", Country = "Canada", Email = "sarah.m@example.com", Status = "At-Risk", CreatedAt = new DateTime(2024, 11, 5, 0, 0, 0, DateTimeKind.Utc), FirstDonationDate = new DateOnly(2024, 11, 10), AcquisitionChannel = "Social Media" },
            new Supporter { SupporterId = 4, SupporterType = "Individual", DisplayName = "Mark Lopez", FirstName = "Mark", LastName = "Lopez", RelationshipType = "Monthly Donor", Country = "Philippines", Email = "mark.lopez@example.com", Status = "Active", CreatedAt = new DateTime(2023, 3, 20, 0, 0, 0, DateTimeKind.Utc), FirstDonationDate = new DateOnly(2023, 4, 1), AcquisitionChannel = "Event" }
        );

        modelBuilder.Entity<Donation>().HasData(
            new Donation { DonationId = 1, SupporterId = 1, DonationType = "Cash", DonationDate = new DateOnly(2025, 3, 1), IsRecurring = true, CampaignName = "Monthly Partners", ChannelSource = "Online", CurrencyCode = "USD", Amount = 100 },
            new Donation { DonationId = 2, SupporterId = 1, DonationType = "Cash", DonationDate = new DateOnly(2025, 2, 1), IsRecurring = true, CampaignName = "Monthly Partners", ChannelSource = "Online", CurrencyCode = "USD", Amount = 100 },
            new Donation { DonationId = 3, SupporterId = 2, DonationType = "Cash", DonationDate = new DateOnly(2025, 1, 15), IsRecurring = false, CampaignName = "Year-End Drive", ChannelSource = "Bank Transfer", CurrencyCode = "PHP", Amount = 250000 },
            new Donation { DonationId = 4, SupporterId = 3, DonationType = "Cash", DonationDate = new DateOnly(2024, 11, 10), IsRecurring = false, CampaignName = "Holiday Giving", ChannelSource = "Online", CurrencyCode = "CAD", Amount = 50 },
            new Donation { DonationId = 5, SupporterId = 4, DonationType = "Cash", DonationDate = new DateOnly(2025, 3, 1), IsRecurring = true, ChannelSource = "GCash", CurrencyCode = "PHP", Amount = 2000 },
            new Donation { DonationId = 6, SupporterId = 2, DonationType = "In-Kind", DonationDate = new DateOnly(2025, 2, 20), IsRecurring = false, CampaignName = "School Supplies Drive", ChannelSource = "Direct", CurrencyCode = "PHP", Amount = 0, EstimatedValue = 45000, ImpactUnit = "school-supplies-kits" }
        );

        modelBuilder.Entity<DonationAllocation>().HasData(
            new DonationAllocation { AllocationId = 1, DonationId = 3, SafehouseId = 1, ProgramArea = "Education", AmountAllocated = 150000, AllocationDate = new DateOnly(2025, 1, 20) },
            new DonationAllocation { AllocationId = 2, DonationId = 3, SafehouseId = 2, ProgramArea = "Health & Nutrition", AmountAllocated = 100000, AllocationDate = new DateOnly(2025, 1, 20) }
        );

        modelBuilder.Entity<InKindDonationItem>().HasData(
            new InKindDonationItem { ItemId = 1, DonationId = 6, ItemName = "Notebooks", ItemCategory = "School Supplies", Quantity = 100, UnitOfMeasure = "pieces", EstimatedUnitValue = 50, IntendedUse = "Education program", ReceivedCondition = "New" },
            new InKindDonationItem { ItemId = 2, DonationId = 6, ItemName = "Backpacks", ItemCategory = "School Supplies", Quantity = 30, UnitOfMeasure = "pieces", EstimatedUnitValue = 800, IntendedUse = "Education program", ReceivedCondition = "New" }
        );

        modelBuilder.Entity<Partner>().HasData(
            new Partner { PartnerId = 1, PartnerName = "Metro Manila Medical Center", PartnerType = "Healthcare Provider", RoleType = "Service Provider", ContactName = "Dr. Liza Tan", Email = "liza.tan@mmmc.ph", Region = "NCR", Status = "Active", StartDate = new DateOnly(2021, 1, 1) },
            new Partner { PartnerId = 2, PartnerName = "Cebu Children's Legal Aid", PartnerType = "Legal Services", RoleType = "Pro-Bono Partner", ContactName = "Atty. Ramon Flores", Email = "rflores@cclaid.org", Region = "VII", Status = "Active", StartDate = new DateOnly(2022, 5, 1) }
        );

        modelBuilder.Entity<PartnerAssignment>().HasData(
            new PartnerAssignment { AssignmentId = 1, PartnerId = 1, SafehouseId = 1, ProgramArea = "Health & Wellness", AssignmentStart = new DateOnly(2021, 1, 1), IsPrimary = true, Status = "Active" },
            new PartnerAssignment { AssignmentId = 2, PartnerId = 2, SafehouseId = 2, ProgramArea = "Legal Assistance", AssignmentStart = new DateOnly(2022, 5, 1), IsPrimary = true, Status = "Active" }
        );

        modelBuilder.Entity<InterventionPlan>().HasData(
            new InterventionPlan { PlanId = 1, ResidentId = 1, PlanCategory = "Education", PlanDescription = "Enroll in ALS Grade 8 program and maintain 90%+ attendance", ServicesProvided = "ALS enrollment, tutorial support", TargetValue = 90, TargetDate = new DateOnly(2025, 10, 31), Status = "In Progress", CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
            new InterventionPlan { PlanId = 2, ResidentId = 2, PlanCategory = "Psychosocial", PlanDescription = "Complete trauma-focused CBT stabilization phase", ServicesProvided = "TF-CBT sessions, peer support group", TargetDate = new DateOnly(2025, 6, 30), Status = "In Progress", CreatedAt = new DateTime(2024, 4, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2025, 3, 10, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<PublicImpactSnapshot>().HasData(
            new PublicImpactSnapshot { SnapshotId = 1, SnapshotDate = new DateOnly(2025, 3, 1), Headline = "HavenBridge Q1 2025: Reaching More Children", SummaryText = "In Q1 2025, HavenBridge served 25 residents across 2 safehouses, provided 47 counseling sessions, and achieved an average education progress of 77%.", MetricPayloadJson = "{\"residents_served\":25,\"counseling_sessions\":47,\"avg_education_progress\":77,\"health_checkups\":38}", IsPublished = true, PublishedAt = new DateTime(2025, 3, 5, 10, 0, 0, DateTimeKind.Utc) }
        );
    }
}
