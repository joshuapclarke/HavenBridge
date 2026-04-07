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
}
