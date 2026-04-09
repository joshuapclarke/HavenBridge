using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class ReportsController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public ReportsController(HavenBridgeContext db) => _db = db;

    [HttpGet("/api/admin/recent-activity")]
    public async Task<ActionResult> GetRecentActivity()
    {
        var recentSessions = await _db.ProcessRecordings
            .Include(p => p.SocialWorker)
            .OrderByDescending(p => p.SessionDate)
            .Take(5)
            .Select(p => new { Type = "Session", Date = p.SessionDate.ToString(), Description = $"{p.SessionType} with resident #{p.ResidentId}", SocialWorkerName = p.SocialWorker != null ? $"{p.SocialWorker.UserFirstName} {p.SocialWorker.UserLastName}" : "" })
            .ToListAsync();

        var recentVisits = await _db.HomeVisitations
            .OrderByDescending(h => h.VisitDate)
            .Take(5)
            .Select(h => new { Type = "Home Visit", Date = h.VisitDate.ToString(), Description = $"{h.VisitType} at {h.LocationVisited}", SocialWorkerName = h.SocialWorker ?? "" })
            .ToListAsync();

        var recentDonations = await _db.Donations
            .Include(d => d.Supporter)
            .OrderByDescending(d => d.DonationDate)
            .Take(5)
            .Select(d => new { Type = "Donation", Date = d.DonationDate.ToString(), Description = $"{d.Supporter!.DisplayName} — {d.CurrencyCode} {d.Amount}", SocialWorkerName = "" })
            .ToListAsync();

        var activity = recentSessions
            .Cast<object>()
            .Concat(recentVisits)
            .Concat(recentDonations)
            .ToList();

        return Ok(activity);
    }

    [HttpGet("charts")]
    public async Task<ActionResult> GetChartData()
    {
        var donationsByMonth = await _db.Donations
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                total = g.Sum(d => (double)d.Amount),
                count = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToListAsync();

        var sessionsByMonth = await _db.ProcessRecordings
            .GroupBy(p => new { p.SessionDate.Year, p.SessionDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                count = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToListAsync();

        var residentsByCategory = await _db.Residents
            .Where(r => r.CaseStatus == "Active")
            .GroupBy(r => r.CaseCategory ?? "Unknown")
            .Select(g => new { category = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var residentsByRisk = await _db.Residents
            .Where(r => r.CaseStatus == "Active")
            .GroupBy(r => r.CurrentRiskLevel ?? "Unknown")
            .Select(g => new { level = g.Key, count = g.Count() })
            .ToListAsync();

        var sessionsByType = await _db.ProcessRecordings
            .GroupBy(p => p.SessionType ?? "Unknown")
            .Select(g => new { type = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var visitsByMonth = await _db.HomeVisitations
            .GroupBy(v => new { v.VisitDate.Year, v.VisitDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                count = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToListAsync();

        var educationByStatus = await _db.EducationRecords
            .GroupBy(e => e.CompletionStatus ?? "Unknown")
            .Select(g => new { status = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var healthOverTime = await _db.HealthWellbeingRecords
            .GroupBy(h => new { h.RecordDate.Year, h.RecordDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                avgHealth = Math.Round(g.Average(h => (double)(h.GeneralHealthScore ?? 0)), 1),
                avgNutrition = Math.Round(g.Average(h => (double)(h.NutritionScore ?? 0)), 1),
                avgSleep = Math.Round(g.Average(h => (double)(h.SleepQualityScore ?? 0)), 1),
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToListAsync();

        var reintegrationByStatus = await _db.Residents
            .Where(r => r.ReintegrationStatus != null && r.ReintegrationStatus != "")
            .GroupBy(r => r.ReintegrationStatus!)
            .Select(g => new { status = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var reintegrationBySafehouse = await _db.Residents
            .Include(r => r.Safehouse)
            .Where(r => r.ReintegrationStatus != null && r.ReintegrationStatus != "")
            .GroupBy(r => new { r.SafehouseId, SafehouseName = r.Safehouse!.Name })
            .Select(g => new
            {
                safehouseId = g.Key.SafehouseId,
                safehouseName = g.Key.SafehouseName,
                successful = g.Count(r => r.ReintegrationStatus == "Successful"),
                inProgress = g.Count(r => r.ReintegrationStatus == "In Progress"),
                pending = g.Count(r => r.ReintegrationStatus == "Pending"),
                failed = g.Count(r => r.ReintegrationStatus == "Failed"),
                total = g.Count(),
            })
            .OrderBy(x => x.safehouseName)
            .ToListAsync();

        return Ok(new
        {
            donationsByMonth,
            sessionsByMonth,
            residentsByCategory,
            residentsByRisk,
            sessionsByType,
            visitsByMonth,
            educationByStatus,
            healthOverTime,
            reintegrationByStatus,
            reintegrationBySafehouse,
        });
    }

    [HttpGet("upcoming-conferences")]
    public async Task<ActionResult> GetUpcomingConferences()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var conferences = await _db.InterventionPlans
            .Where(p => p.CaseConferenceDate != null && p.CaseConferenceDate >= today)
            .Include(p => p.Resident)
            .OrderBy(p => p.CaseConferenceDate)
            .Take(10)
            .Select(p => new
            {
                p.PlanId,
                p.CaseConferenceDate,
                p.PlanCategory,
                p.Status,
                residentCode = p.Resident!.InternalCode,
                residentId = p.ResidentId,
                safehouseName = p.Resident.Safehouse!.Name,
            })
            .ToListAsync();

        return Ok(conferences);
    }

    [HttpGet("annual/{year}")]
    public async Task<ActionResult> GetAnnualReport(int year)
    {
        var startDate = new DateOnly(year, 1, 1);
        var endDate = new DateOnly(year, 12, 31);

        var admissions = await _db.Residents
            .CountAsync(r => r.DateOfAdmission >= startDate && r.DateOfAdmission <= endDate);

        var discharges = await _db.Residents
            .CountAsync(r => r.DateClosed >= startDate && r.DateClosed <= endDate);

        var activeAtYearEnd = await _db.Residents
            .CountAsync(r => r.CaseStatus == "Active" ||
                (r.DateOfAdmission <= endDate && (r.DateClosed == null || r.DateClosed >= startDate)));

        var totalSessions = await _db.ProcessRecordings
            .CountAsync(p => p.SessionDate >= startDate && p.SessionDate <= endDate);

        var totalSessionMinutes = await _db.ProcessRecordings
            .Where(p => p.SessionDate >= startDate && p.SessionDate <= endDate)
            .SumAsync(p => p.SessionDurationMinutes);

        var sessionsByType = await _db.ProcessRecordings
            .Where(p => p.SessionDate >= startDate && p.SessionDate <= endDate)
            .GroupBy(p => p.SessionType ?? "Unknown")
            .Select(g => new { type = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var totalVisits = await _db.HomeVisitations
            .CountAsync(v => v.VisitDate >= startDate && v.VisitDate <= endDate);

        var totalDonations = await _db.Donations
            .Where(d => d.DonationDate >= startDate && d.DonationDate <= endDate)
            .SumAsync(d => (double?)d.Amount) ?? 0;

        var donationCount = await _db.Donations
            .CountAsync(d => d.DonationDate >= startDate && d.DonationDate <= endDate);

        var uniqueDonors = await _db.Donations
            .Where(d => d.DonationDate >= startDate && d.DonationDate <= endDate)
            .Select(d => d.SupporterId)
            .Distinct()
            .CountAsync();

        var residentsByCategory = await _db.Residents
            .Where(r => r.DateOfAdmission <= endDate && (r.DateClosed == null || r.DateClosed >= startDate))
            .GroupBy(r => r.CaseCategory ?? "Unknown")
            .Select(g => new { category = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var residentsBySafehouse = await _db.Residents
            .Where(r => r.DateOfAdmission <= endDate && (r.DateClosed == null || r.DateClosed >= startDate))
            .Include(r => r.Safehouse)
            .GroupBy(r => r.Safehouse!.Name ?? "Unknown")
            .Select(g => new { safehouse = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var incidents = await _db.IncidentReports
            .CountAsync(i => i.IncidentDate >= startDate && i.IncidentDate <= endDate);

        var resolvedIncidents = await _db.IncidentReports
            .CountAsync(i => i.IncidentDate >= startDate && i.IncidentDate <= endDate && i.Resolved);

        var availableYears = await _db.Residents
            .Where(r => r.DateOfAdmission != null)
            .Select(r => r.DateOfAdmission!.Value.Year)
            .Union(_db.Donations.Select(d => d.DonationDate.Year))
            .Distinct()
            .OrderByDescending(y => y)
            .ToListAsync();

        var conferenceCount = await _db.InterventionPlans
            .CountAsync(p => p.CaseConferenceDate != null
                && p.CaseConferenceDate >= startDate && p.CaseConferenceDate <= endDate);

        var educationEnrolled = await _db.EducationRecords
            .Where(e => e.RecordDate >= startDate && e.RecordDate <= endDate)
            .CountAsync(e => e.EnrollmentStatus == "Enrolled" || e.EnrollmentStatus == "Active");

        var educationCompleted = await _db.EducationRecords
            .Where(e => e.RecordDate >= startDate && e.RecordDate <= endDate)
            .CountAsync(e => e.CompletionStatus == "Completed" || e.CompletionStatus == "Graduated");

        var avgAttendance = await _db.EducationRecords
            .Where(e => e.RecordDate >= startDate && e.RecordDate <= endDate && e.AttendanceRate != null)
            .AverageAsync(e => (double?)e.AttendanceRate) ?? 0;

        var healthRecordCount = await _db.HealthWellbeingRecords
            .CountAsync(h => h.RecordDate >= startDate && h.RecordDate <= endDate);

        var avgHealthScore = await _db.HealthWellbeingRecords
            .Where(h => h.RecordDate >= startDate && h.RecordDate <= endDate && h.GeneralHealthScore != null)
            .AverageAsync(h => (double?)h.GeneralHealthScore) ?? 0;

        var avgNutritionScore = await _db.HealthWellbeingRecords
            .Where(h => h.RecordDate >= startDate && h.RecordDate <= endDate && h.NutritionScore != null)
            .AverageAsync(h => (double?)h.NutritionScore) ?? 0;

        var reintegrationByStatus = await _db.Residents
            .Where(r => r.DateOfAdmission <= endDate && (r.DateClosed == null || r.DateClosed >= startDate))
            .Where(r => r.ReintegrationStatus != null && r.ReintegrationStatus != "")
            .GroupBy(r => r.ReintegrationStatus!)
            .Select(g => new { status = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        return Ok(new
        {
            year,
            availableYears,
            residents = new { admissions, discharges, activeAtYearEnd, byCategory = residentsByCategory, bySafehouse = residentsBySafehouse },
            sessions = new { total = totalSessions, totalMinutes = totalSessionMinutes, byType = sessionsByType },
            homeVisits = totalVisits,
            conferences = conferenceCount,
            education = new { enrolled = educationEnrolled, completed = educationCompleted, avgAttendance = Math.Round(avgAttendance, 1) },
            health = new { records = healthRecordCount, avgHealthScore = Math.Round(avgHealthScore, 1), avgNutritionScore = Math.Round(avgNutritionScore, 1) },
            reintegration = reintegrationByStatus,
            donations = new { totalAmount = totalDonations, count = donationCount, uniqueDonors },
            incidents = new { total = incidents, resolved = resolvedIncidents }
        });
    }

    [HttpGet("ml-pipelines")]
    public ActionResult GetMlPipelineSummaries()
    {
        var pipelines = new[]
        {
            new
            {
                id = "social-media-donation-predictor",
                title = "Social Media Donation Predictor",
                objective = "Predict donation-driving posts and estimate referral/value lift from social content.",
                keyMetrics = new[]
                {
                    "AUC-ROC: 0.970",
                    "Donation Count RMSE: 20.037",
                    "Donation Count MAE: 6.493",
                    "Donation Count R²: 0.628",
                    "Donation Value RMSE: 79,034.51 PHP",
                    "Donation Value MAE: 29,379.50 PHP",
                    "Donation Value R²: 0.508",
                    "Cross-val Mean RMSE: 19.729 (+/- 12.438)"
                },
                insights = new[]
                {
                    "Top feature importance analysis completed for donation-driving content.",
                    "Model supports both classification (drives donations) and regression (count/value)."
                },
                adminActions = new[]
                {
                    "Prioritize formats and topics that earn saves and shares—Random Forest ranked shares, share rate, saves, and post type ahead of generic likes, so briefs should chase distribution (reshares) not vanity engagement alone.",
                    "Treat high engagement rate with caution: in-pipeline EDA shows only a modest correlation with donation referrals, so do not let “most liked” posts dictate budget if they rarely convert.",
                    "Double down on resident-story-led creative (the notebook segments ThankYou, EducationalContent, Photo/Video/Reel mix)—posts flagged with resident narratives historically lift donation referrals more than feed filler.",
                    "Retarget paid/boost spend toward posts that already drive profile visits and click-throughs; those features sit in the top donation drivers alongside saves."
                }
            },
            new
            {
                id = "donor-churn",
                title = "Donor Churn Classifier",
                objective = "Identify donors likely to churn so staff can intervene with retention outreach.",
                keyMetrics = new[]
                {
                    "Threshold tuned to 0.25 for higher churn recall",
                    "Classification report generated with imbalance-aware setup"
                },
                insights = new[]
                {
                    "Pipeline prioritizes finding at-risk donors over raw accuracy.",
                    "Configured for scalability as donor history grows."
                },
                adminActions = new[]
                {
                    "Retention signal is stronger from donation frequency than from gift size—the notebook’s Random Forest and write-up emphasize `total_donations` over amount; design stewardship that secures a 2nd and 3rd gift, not only larger one-offs.",
                    "Acquisition channel skews churn: historical EDA shows Word-of-Mouth lapsing more than Partner Referral or Social Media—invest in partner co-marketing and social funnels, and add proactive touchpoints for word-of-mouth donors before day 365.",
                    "The model’s 0.25 probability threshold is tuned for recall—expect false alarms on the CRM dashboard; train staff to treat scores as “schedule a human check-in,” not automatic churn.",
                    "Keep recency out of the training features by design (leakage prevention)—operational playbooks should still use plain “days since gift” for timing outreach even though the model score does not."
                }
            },
            new
            {
                id = "reintegration-readiness",
                title = "Reintegration Readiness Model",
                objective = "Score resident readiness for reintegration and support safer discharge decisions.",
                keyMetrics = new[]
                {
                    "AUC-ROC: 1.000",
                    "Cross-validation AUC-ROC: [0.96875, 1.00000, 0.96875, 0.84375, 0.81250]",
                    "Mean AUC-ROC: 0.919 (+/- 0.151)"
                },
                insights = new[]
                {
                    "Ranks top drivers across health, education, intervention, and incident history.",
                    "Outputs readiness score and predicted reintegration status."
                },
                adminActions = new[]
                {
                    "Feature importance ranks follow-up workload and visit volume first—do not green-light discharge until outstanding follow-ups are cleared and home/case visits meet the cadence implied by high-readiness profiles.",
                    "Health and nutrition trajectories (`avg_health_score`, `avg_nutrition`, trends) materially move the score—delay transition planning when biometric trends flatten or worsen even if paperwork looks complete.",
                    "Safety concern counts and favorable-rate signals show up near the top—pair discharge reviews with a structured check that recent safety flags and progress trends align, not only a static checklist."
                }
            },
            new
            {
                id = "resident-risk-classifier",
                title = "Resident Risk Classifier",
                objective = "Classify resident risk level to prioritize casework and intervention planning.",
                keyMetrics = new[]
                {
                    "Cross-validation F1 scores: [0.537, 0.587, 0.587, 0.660, 0.313]",
                    "Mean F1: 0.537 (+/- 0.237)"
                },
                insights = new[]
                {
                    "Top risk predictors extracted for caseworker guidance.",
                    "Designed to handle imbalanced multi-class risk outcomes."
                },
                adminActions = new[]
                {
                    "Sleep quality (`avg_sleep_score`) and unresolved concern counts are among the strongest lifts—escalate caseload when sleep metrics slip or concerns backlog before a formal risk label changes.",
                    "Incident volume and in-progress intervention plans both rank highly—use the classifier to rebalance time toward residents bundling multiple open plans or rising incident counts.",
                    "Session length and total sessions matter—ensure high-risk residents keep substantive counseling blocks rather than being squeezed into token check-ins."
                }
            },
            new
            {
                id = "intervention-effectiveness",
                title = "Intervention Effectiveness Model",
                objective = "Estimate probability that an intervention plan leads to resident progress.",
                keyMetrics = new[]
                {
                    "AUC-ROC: 1.000",
                    "Top intervention lift analysis generated"
                },
                insights = new[]
                {
                    "Highlights interventions with strongest progress impact.",
                    "Provides probability-oriented decision support for plan selection."
                },
                adminActions = new[]
                {
                    "Logistic regression odds show session duration and session type dominate progress—protect longer one-to-one blocks for complex cases; the notebook summary notes group formats underperform for high-risk residents versus individual sessions.",
                    "Residents who start sessions in a positive emotional frame see measurably better progress—where possible, schedule emotionally heavy interventions after stabilizing sessions or check-ins that improve mood.",
                    "Match intervention class to the case plan deliberately—the pipeline is explanatory; use it to retire low-progress intervention mixes and standardize the combinations that repeatedly score well in session logs."
                }
            },
            new
            {
                id = "donor-lifetime-value",
                title = "Donor Lifetime Value Model",
                objective = "Forecast donor value and identify high-value donor segments for stewardship.",
                keyMetrics = new[]
                {
                    "RMSE: 2,497.48 PHP",
                    "MAE: 1,516.06 PHP",
                    "R²: 0.564",
                    "Gradient Boosting R²: 0.565",
                    "Gradient Boosting RMSE: 2,494.75 PHP",
                    "High-value donor AUC-ROC: 1.000"
                },
                insights = new[]
                {
                    "Feature importance surfaced for both value regression and high-value classification.",
                    "Supports prioritization of donor relationship investments."
                },
                adminActions = new[]
                {
                    "Segmentation output ranks Social Media and Church channels highest on average lifetime value—shift prospecting and matching gift asks toward those funnels before defaulting to cheapest lead sources.",
                    "Monetary donors and volunteers show the strongest high-value rates versus social-media advocates or in-kind-only profiles—prioritize major-donor pipeline work and volunteer-to-donor conversion, not only follower growth.",
                    "Website-acquired and word-of-mouth cohorts show the lowest hit-rate of high-value donors in the EDA tables—invest in onboarding journeys (welcome series, first 90 days) specifically for those two entry paths.",
                    "Pair model tiers with behavior: the regressors emphasize monetary history and channel mix—use the scores to decide who receives executive touchpoints versus scalable digital stewardship."
                }
            }
        };

        return Ok(new { pipelines });
    }
}
