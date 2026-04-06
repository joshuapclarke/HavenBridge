using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public AdminController(HavenBridgeContext db) => _db = db;

    [HttpGet("recent-activity")]
    public async Task<ActionResult> GetRecentActivity()
    {
        var recentSessions = await _db.ProcessRecordings
            .OrderByDescending(p => p.SessionDate)
            .Take(5)
            .Select(p => new { Type = "Session", Date = p.SessionDate.ToString(), Description = $"{p.SessionType} with resident #{p.ResidentId}", p.SocialWorker })
            .ToListAsync();

        var recentVisits = await _db.HomeVisitations
            .OrderByDescending(h => h.VisitDate)
            .Take(5)
            .Select(h => new { Type = "Home Visit", Date = h.VisitDate.ToString(), Description = $"{h.VisitType} at {h.LocationVisited}", h.SocialWorker })
            .ToListAsync();

        var recentDonations = await _db.Donations
            .Include(d => d.Supporter)
            .OrderByDescending(d => d.DonationDate)
            .Take(5)
            .Select(d => new { Type = "Donation", Date = d.DonationDate.ToString(), Description = $"{d.Supporter!.DisplayName} — {d.CurrencyCode} {d.Amount}", SocialWorker = "" })
            .ToListAsync();

        var activity = recentSessions
            .Cast<object>()
            .Concat(recentVisits)
            .Concat(recentDonations)
            .ToList();

        return Ok(activity);
    }

    [HttpGet("search")]
    public async Task<ActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { residents = Array.Empty<object>(), supporters = Array.Empty<object>() });

        var residents = await _db.Residents
            .Where(r => r.InternalCode!.Contains(q) || r.CaseControlNo!.Contains(q) || r.AssignedSocialWorker!.Contains(q))
            .Take(10)
            .Select(r => new { r.ResidentId, r.InternalCode, r.CaseControlNo, r.CaseStatus, r.CurrentRiskLevel })
            .ToListAsync();

        var supporters = await _db.Supporters
            .Where(s => s.DisplayName.Contains(q) || s.Email!.Contains(q))
            .Take(10)
            .Select(s => new { s.SupporterId, s.DisplayName, s.Email, s.Status })
            .ToListAsync();

        return Ok(new { residents, supporters });
    }
}
