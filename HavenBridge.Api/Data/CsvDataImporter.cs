using System.Globalization;
using HavenBridge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HavenBridge.Api.Data;

public static class CsvDataImporter
{
    public static async Task ImportAllAsync(HavenBridgeContext db, string seedFolder)
    {
        if (await db.Safehouses.AnyAsync()) return;

        await ImportRoles(db, Path.Combine(seedFolder, "roles.csv"));
        await ImportSafehouses(db, Path.Combine(seedFolder, "safehouses.csv"));
        await ImportPartners(db, Path.Combine(seedFolder, "partners.csv"));
        await ImportSupporters(db, Path.Combine(seedFolder, "supporters.csv"));
        await db.SaveChangesAsync();

        await ImportUsers(db, Path.Combine(seedFolder, "users.csv"));
        await db.SaveChangesAsync();

        await ImportResidents(db, Path.Combine(seedFolder, "residents.csv"));
        await ImportDonations(db, Path.Combine(seedFolder, "donations.csv"));
        await db.SaveChangesAsync();

        await ImportDonationAllocations(db, Path.Combine(seedFolder, "donation_allocations.csv"));
        await ImportInKindDonationItems(db, Path.Combine(seedFolder, "in_kind_donation_items.csv"));
        await ImportPartnerAssignments(db, Path.Combine(seedFolder, "partner_assignments.csv"));
        await db.SaveChangesAsync();

        await ImportProcessRecordings(db, Path.Combine(seedFolder, "process_recordings.csv"));
        await ImportHomeVisitations(db, Path.Combine(seedFolder, "home_visitations.csv"));
        await ImportHealthRecords(db, Path.Combine(seedFolder, "health_wellbeing_records.csv"));
        await ImportEducationRecords(db, Path.Combine(seedFolder, "education_records.csv"));
        await ImportIncidentReports(db, Path.Combine(seedFolder, "incident_reports.csv"));
        await ImportInterventionPlans(db, Path.Combine(seedFolder, "intervention_plans.csv"));
        await db.SaveChangesAsync();

        await ImportSafehouseMetrics(db, Path.Combine(seedFolder, "safehouse_monthly_metrics.csv"));
        await ImportSocialMediaPosts(db, Path.Combine(seedFolder, "social_media_posts.csv"));
        await ImportPublicSnapshots(db, Path.Combine(seedFolder, "public_impact_snapshots.csv"));
        await db.SaveChangesAsync();
    }

    private static string[] ParseCsvLine(string line)
    {
        var fields = new List<string>();
        bool inQuotes = false;
        var current = new System.Text.StringBuilder();
        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (c == '"') { inQuotes = !inQuotes; continue; }
            if (c == ',' && !inQuotes) { fields.Add(current.ToString()); current.Clear(); continue; }
            current.Append(c);
        }
        fields.Add(current.ToString());
        return fields.ToArray();
    }

    private static string? NullIfEmpty(string s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
    private static int ParseInt(string s) => int.TryParse(s, out var v) ? v : 0;
    private static int? ParseIntNull(string s) => int.TryParse(s, out var v) ? v : null;
    private static float ParseFloat(string s) => float.TryParse(s, CultureInfo.InvariantCulture, out var v) ? v : 0;
    private static float? ParseFloatNull(string s) => float.TryParse(s, CultureInfo.InvariantCulture, out var v) ? v : null;
    private static bool ParseBool(string s) => s.Trim().Equals("True", StringComparison.OrdinalIgnoreCase);
    private static DateOnly? ParseDateNull(string s) => DateOnly.TryParse(s, out var v) ? v : null;
    private static DateOnly ParseDate(string s) => DateOnly.TryParse(s, out var v) ? v : DateOnly.FromDateTime(DateTime.UtcNow);
    private static DateTime ParseDateTime(string s) => DateTime.TryParse(s, out var v) ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : DateTime.UtcNow;
    private static DateTime? ParseDateTimeNull(string s) => DateTime.TryParse(s, out var v) ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : null;

    private static async Task ImportRoles(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.Roles.Add(new Role
            {
                RoleId = ParseInt(f[0]), Description = f[1]
            });
        }
    }

    private static async Task ImportUsers(HavenBridgeContext db, string path)
    {
        var defaultHash = BCrypt.Net.BCrypt.HashPassword("password123");

        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            var rawHash = f[4];
            var passwordHash = rawHash == "PLACEHOLDER_HASH" ? defaultHash : rawHash;

            db.Users.Add(new User
            {
                UserId = ParseInt(f[0]), RoleId = ParseInt(f[1]),
                SupporterId = ParseIntNull(f[2]),
                Username = f[3], PasswordHash = passwordHash,
                UserFirstName = NullIfEmpty(f[5]), UserLastName = NullIfEmpty(f[6]),
                IsSocialWorker = ParseBool(f[7])
            });
        }

        // Seed an admin user if one doesn't already exist in the CSV
        var maxId = (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l))
            .Select(l => ParseInt(ParseCsvLine(l)[0])).DefaultIfEmpty(0).Max();

        db.Users.Add(new User
        {
            UserId = maxId + 1,
            RoleId = 1,
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            UserFirstName = "System",
            UserLastName = "Admin",
            IsSocialWorker = false
        });
    }

    private static async Task ImportSafehouses(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.Safehouses.Add(new Safehouse
            {
                SafehouseId = ParseInt(f[0]), SafehouseCode = f[1], Name = f[2], Region = NullIfEmpty(f[3]),
                City = NullIfEmpty(f[4]), Province = NullIfEmpty(f[5]), Country = NullIfEmpty(f[6]),
                OpenDate = ParseDateNull(f[7]), Status = f[8], CapacityGirls = ParseInt(f[9]),
                CapacityStaff = ParseInt(f[10]), CurrentOccupancy = ParseInt(f[11]), Notes = NullIfEmpty(f[12])
            });
        }
    }

    private static async Task ImportResidents(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.Residents.Add(new Resident
            {
                ResidentId = ParseInt(f[0]), CaseControlNo = NullIfEmpty(f[1]), InternalCode = NullIfEmpty(f[2]),
                SafehouseId = ParseInt(f[3]), CaseStatus = f[4], Sex = NullIfEmpty(f[5]),
                DateOfBirth = ParseDateNull(f[6]), BirthStatus = NullIfEmpty(f[7]), PlaceOfBirth = NullIfEmpty(f[8]),
                Religion = NullIfEmpty(f[9]), CaseCategory = NullIfEmpty(f[10]),
                SubCatOrphaned = ParseBool(f[11]), SubCatTrafficked = ParseBool(f[12]), SubCatChildLabor = ParseBool(f[13]),
                SubCatPhysicalAbuse = ParseBool(f[14]), SubCatSexualAbuse = ParseBool(f[15]), SubCatOsaec = ParseBool(f[16]),
                SubCatCicl = ParseBool(f[17]), SubCatAtRisk = ParseBool(f[18]), SubCatStreetChild = ParseBool(f[19]),
                SubCatChildWithHiv = ParseBool(f[20]),
                IsPwd = ParseBool(f[21]), PwdType = NullIfEmpty(f[22]),
                HasSpecialNeeds = ParseBool(f[23]), SpecialNeedsDiagnosis = NullIfEmpty(f[24]),
                FamilyIs4Ps = ParseBool(f[25]), FamilySoloParent = ParseBool(f[26]),
                FamilyIndigenous = ParseBool(f[27]), FamilyParentPwd = ParseBool(f[28]),
                FamilyInformalSettler = ParseBool(f[29]),
                DateOfAdmission = ParseDateNull(f[30]), AgeUponAdmission = NullIfEmpty(f[31]),
                PresentAge = NullIfEmpty(f[32]), LengthOfStay = NullIfEmpty(f[33]),
                ReferralSource = NullIfEmpty(f[34]), ReferringAgencyPerson = NullIfEmpty(f[35]),
                DateColbRegistered = ParseDateNull(f[36]), DateColbObtained = ParseDateNull(f[37]),
                AssignedSocialWorker = NullIfEmpty(f[38]), InitialCaseAssessment = NullIfEmpty(f[39]),
                DateCaseStudyPrepared = ParseDateNull(f[40]),
                ReintegrationType = NullIfEmpty(f[41]), ReintegrationStatus = NullIfEmpty(f[42]),
                InitialRiskLevel = NullIfEmpty(f[43]), CurrentRiskLevel = NullIfEmpty(f[44]),
                DateEnrolled = ParseDateNull(f[45]), DateClosed = ParseDateNull(f[46]),
                CreatedAt = ParseDateTime(f[47]), NotesRestricted = f.Length > 48 && ParseBool(f[48])
            });
        }
    }

    private static async Task ImportSupporters(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.Supporters.Add(new Supporter
            {
                SupporterId = ParseInt(f[0]), SupporterType = NullIfEmpty(f[1]), DisplayName = f[2],
                OrganizationName = NullIfEmpty(f[3]), FirstName = NullIfEmpty(f[4]), LastName = NullIfEmpty(f[5]),
                RelationshipType = NullIfEmpty(f[6]), Region = NullIfEmpty(f[7]), Country = NullIfEmpty(f[8]),
                Email = NullIfEmpty(f[9]), Phone = NullIfEmpty(f[10]), Status = f[11],
                CreatedAt = ParseDateTime(f[12]), FirstDonationDate = ParseDateNull(f[13]),
                AcquisitionChannel = NullIfEmpty(f[14])
            });
        }
    }

    private static async Task ImportDonations(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.Donations.Add(new Donation
            {
                DonationId = ParseInt(f[0]), SupporterId = ParseInt(f[1]), DonationType = NullIfEmpty(f[2]),
                DonationDate = ParseDate(f[3]), IsRecurring = ParseBool(f[4]),
                CampaignName = NullIfEmpty(f[5]), ChannelSource = NullIfEmpty(f[6]),
                CurrencyCode = string.IsNullOrWhiteSpace(f[7]) ? "PHP" : f[7],
                Amount = ParseFloat(f[8]), EstimatedValue = ParseFloatNull(f[9]),
                ImpactUnit = NullIfEmpty(f[10]), Notes = NullIfEmpty(f[11]),
                ReferralPostId = ParseIntNull(f.Length > 12 ? f[12] : "")
            });
        }
    }

    private static async Task ImportDonationAllocations(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            var safehouseId = (int)ParseFloat(f[2]);
            if (safehouseId == 0) continue;
            db.DonationAllocations.Add(new DonationAllocation
            {
                AllocationId = ParseInt(f[0]), DonationId = ParseInt(f[1]), SafehouseId = safehouseId,
                ProgramArea = NullIfEmpty(f[3]), AmountAllocated = ParseFloat(f[4]),
                AllocationDate = ParseDateNull(f[5]), AllocationNotes = NullIfEmpty(f[6])
            });
        }
    }

    private static async Task ImportInKindDonationItems(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.InKindDonationItems.Add(new InKindDonationItem
            {
                ItemId = ParseInt(f[0]), DonationId = ParseInt(f[1]), ItemName = f[2],
                ItemCategory = NullIfEmpty(f[3]), Quantity = ParseInt(f[4]),
                UnitOfMeasure = NullIfEmpty(f[5]), EstimatedUnitValue = ParseFloatNull(f[6]),
                IntendedUse = NullIfEmpty(f[7]), ReceivedCondition = NullIfEmpty(f[8])
            });
        }
    }

    private static async Task ImportPartners(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.Partners.Add(new Partner
            {
                PartnerId = ParseInt(f[0]), PartnerName = f[1], PartnerType = NullIfEmpty(f[2]),
                RoleType = NullIfEmpty(f[3]), ContactName = NullIfEmpty(f[4]),
                Email = NullIfEmpty(f[5]), Phone = NullIfEmpty(f[6]), Region = NullIfEmpty(f[7]),
                Status = f[8], StartDate = ParseDateNull(f[9]), EndDate = ParseDateNull(f[10]),
                Notes = NullIfEmpty(f[11])
            });
        }
    }

    private static async Task ImportPartnerAssignments(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            var safehouseId = (int)ParseFloat(f[2]);
            if (safehouseId == 0) continue;
            db.PartnerAssignments.Add(new PartnerAssignment
            {
                AssignmentId = ParseInt(f[0]), PartnerId = ParseInt(f[1]), SafehouseId = safehouseId,
                ProgramArea = NullIfEmpty(f[3]), AssignmentStart = ParseDateNull(f[4]),
                AssignmentEnd = ParseDateNull(f[5]), ResponsibilityNotes = NullIfEmpty(f[6]),
                IsPrimary = ParseBool(f[7]), Status = f[8]
            });
        }
    }

    private static async Task ImportProcessRecordings(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.ProcessRecordings.Add(new ProcessRecording
            {
                RecordingId = ParseInt(f[0]), ResidentId = ParseInt(f[1]), SessionDate = ParseDate(f[2]),
                SocialWorkerId = ParseIntNull(f[3]), SessionType = NullIfEmpty(f[4]),
                SessionDurationMinutes = ParseInt(f[5]),
                EmotionalStateObserved = NullIfEmpty(f[6]), EmotionalStateEnd = NullIfEmpty(f[7]),
                SessionNarrative = NullIfEmpty(f[8]), InterventionsApplied = NullIfEmpty(f[9]),
                FollowUpActions = NullIfEmpty(f[10]),
                ProgressNoted = ParseBool(f[11]), ConcernsFlagged = ParseBool(f[12]),
                ReferralMade = ParseBool(f[13]),
                NotesRestricted = f.Length > 14 && ParseBool(f[14])
            });
        }
    }

    private static async Task ImportHomeVisitations(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.HomeVisitations.Add(new HomeVisitation
            {
                VisitationId = ParseInt(f[0]), ResidentId = ParseInt(f[1]), VisitDate = ParseDate(f[2]),
                SocialWorker = NullIfEmpty(f[3]), VisitType = NullIfEmpty(f[4]),
                LocationVisited = NullIfEmpty(f[5]), FamilyMembersPresent = NullIfEmpty(f[6]),
                Purpose = NullIfEmpty(f[7]), Observations = NullIfEmpty(f[8]),
                FamilyCooperationLevel = NullIfEmpty(f[9]),
                SafetyConcernsNoted = ParseBool(f[10]), FollowUpNeeded = ParseBool(f[11]),
                FollowUpNotes = NullIfEmpty(f[12]), VisitOutcome = NullIfEmpty(f[13])
            });
        }
    }

    private static async Task ImportHealthRecords(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.HealthWellbeingRecords.Add(new HealthWellbeingRecord
            {
                HealthRecordId = ParseInt(f[0]), ResidentId = ParseInt(f[1]), RecordDate = ParseDate(f[2]),
                GeneralHealthScore = ParseFloatNull(f[3]), NutritionScore = ParseFloatNull(f[4]),
                SleepQualityScore = ParseFloatNull(f[5]), EnergyLevelScore = ParseFloatNull(f[6]),
                HeightCm = ParseFloatNull(f[7]), WeightKg = ParseFloatNull(f[8]), Bmi = ParseFloatNull(f[9]),
                MedicalCheckupDone = ParseBool(f[10]), DentalCheckupDone = ParseBool(f[11]),
                PsychologicalCheckupDone = ParseBool(f[12]), Notes = NullIfEmpty(f[13])
            });
        }
    }

    private static async Task ImportEducationRecords(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.EducationRecords.Add(new EducationRecord
            {
                EducationRecordId = ParseInt(f[0]), ResidentId = ParseInt(f[1]), RecordDate = ParseDate(f[2]),
                EducationLevel = NullIfEmpty(f[3]), SchoolName = NullIfEmpty(f[4]),
                EnrollmentStatus = NullIfEmpty(f[5]),
                AttendanceRate = ParseFloatNull(f[6]), ProgressPercent = ParseFloatNull(f[7]),
                CompletionStatus = NullIfEmpty(f[8]), Notes = NullIfEmpty(f[9])
            });
        }
    }

    private static async Task ImportIncidentReports(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.IncidentReports.Add(new IncidentReport
            {
                IncidentId = ParseInt(f[0]), ResidentId = ParseInt(f[1]), SafehouseId = ParseInt(f[2]),
                IncidentDate = ParseDate(f[3]), IncidentType = NullIfEmpty(f[4]),
                Severity = NullIfEmpty(f[5]), Description = NullIfEmpty(f[6]),
                ResponseTaken = NullIfEmpty(f[7]), Resolved = ParseBool(f[8]),
                ResolutionDate = ParseDateNull(f[9]), ReportedBy = NullIfEmpty(f[10]),
                FollowUpRequired = ParseBool(f[11]),
                UserId = f.Length > 12 ? ParseIntNull(f[12]) : null
            });
        }
    }

    private static async Task ImportInterventionPlans(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.InterventionPlans.Add(new InterventionPlan
            {
                PlanId = ParseInt(f[0]), ResidentId = ParseInt(f[1]),
                PlanCategory = NullIfEmpty(f[2]), PlanDescription = NullIfEmpty(f[3]),
                ServicesProvided = NullIfEmpty(f[4]), TargetValue = ParseFloatNull(f[5]),
                TargetDate = ParseDateNull(f[6]), Status = f[7],
                CaseConferenceDate = ParseDateNull(f[8]),
                CreatedAt = ParseDateTime(f[9]), UpdatedAt = ParseDateTime(f[10])
            });
        }
    }

    private static async Task ImportSafehouseMetrics(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.SafehouseMonthlyMetrics.Add(new SafehouseMonthlyMetric
            {
                MetricId = ParseInt(f[0]), SafehouseId = ParseInt(f[1]),
                MonthStart = ParseDate(f[2]), MonthEnd = ParseDate(f[3]),
                ActiveResidents = ParseInt(f[4]),
                AvgEducationProgress = ParseFloatNull(f[5]), AvgHealthScore = ParseFloatNull(f[6]),
                ProcessRecordingCount = ParseInt(f[7]), HomeVisitationCount = ParseInt(f[8]),
                IncidentCount = ParseInt(f[9]), Notes = NullIfEmpty(f[10])
            });
        }
    }

    private static async Task ImportSocialMediaPosts(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.SocialMediaPosts.Add(new SocialMediaPost
            {
                PostId = ParseInt(f[0]), Platform = NullIfEmpty(f[1]),
                PlatformPostId = NullIfEmpty(f[2]), PostUrl = NullIfEmpty(f[3]),
                CreatedAt = ParseDateTime(f[4]), DayOfWeek = NullIfEmpty(f[5]),
                PostHour = ParseIntNull(f[6]) is int ph ? Math.Clamp(ph, 0, 23) : null,
                PostType = NullIfEmpty(f[7]), MediaType = NullIfEmpty(f[8]),
                Caption = NullIfEmpty(f[9]), Hashtags = NullIfEmpty(f[10]),
                NumHashtags = ParseInt(f[11]), MentionsCount = ParseInt(f[12]),
                HasCallToAction = ParseBool(f[13]), CallToActionType = NullIfEmpty(f[14]),
                ContentTopic = NullIfEmpty(f[15]), SentimentTone = NullIfEmpty(f[16]),
                CaptionLength = ParseInt(f[17]), FeaturesResidentStory = ParseBool(f[18]),
                CampaignName = NullIfEmpty(f[19]), IsBoosted = ParseBool(f[20]),
                BoostBudgetPhp = ParseFloatNull(f[21]),
                Impressions = ParseInt(f[22]), Reach = ParseInt(f[23]),
                Likes = ParseInt(f[24]), Comments = ParseInt(f[25]),
                Shares = ParseInt(f[26]), Saves = ParseInt(f[27]),
                ClickThroughs = ParseInt(f[28]), VideoViews = ParseInt(f[29]),
                EngagementRate = ParseFloatNull(f[30]), ProfileVisits = ParseInt(f[31]),
                DonationReferrals = ParseInt(f[32]),
                EstimatedDonationValuePhp = ParseFloatNull(f[33]),
                FollowerCountAtPost = ParseInt(f[34]),
                WatchTimeSeconds = ParseFloatNull(f[35]),
                AvgViewDurationSeconds = ParseFloatNull(f[36]),
                SubscriberCountAtPost = ParseInt(f[37]),
                Forwards = ParseInt(f[38])
            });
        }
    }

    private static async Task ImportPublicSnapshots(HavenBridgeContext db, string path)
    {
        foreach (var f in (await File.ReadAllLinesAsync(path)).Skip(1).Where(l => !string.IsNullOrWhiteSpace(l)).Select(ParseCsvLine))
        {
            db.PublicImpactSnapshots.Add(new PublicImpactSnapshot
            {
                SnapshotId = ParseInt(f[0]), SnapshotDate = ParseDate(f[1]),
                Headline = NullIfEmpty(f[2]), SummaryText = NullIfEmpty(f[3]),
                MetricPayloadJson = NullIfEmpty(f[4]), IsPublished = ParseBool(f[5]),
                PublishedAt = ParseDateTimeNull(f[6])
            });
        }
    }
}

