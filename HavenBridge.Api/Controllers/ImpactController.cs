using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImpactController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public ImpactController(HavenBridgeContext db) => _db = db;

    [HttpGet("snapshots")]
    public async Task<ActionResult> GetPublished()
    {
        var snapshots = await _db.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.SnapshotDate)
            .ToListAsync();

        return Ok(snapshots);
    }

    [HttpGet("donor/{supporterId}")]
    public async Task<ActionResult> GetDonorImpact(int supporterId)
    {
        var totalGiven = await _db.Donations
            .Where(d => d.SupporterId == supporterId)
            .SumAsync(d => (double?)d.Amount) ?? 0;

        var donationCount = await _db.Donations
            .CountAsync(d => d.SupporterId == supporterId);

        var allocations = await _db.DonationAllocations
            .Include(a => a.Safehouse)
            .Include(a => a.Donation)
            .Where(a => a.Donation!.SupporterId == supporterId)
            .Select(a => new { a.ProgramArea, a.AmountAllocated, SafehouseName = a.Safehouse!.Name })
            .ToListAsync();

        var campaigns = await _db.Donations
            .Where(d => d.SupporterId == supporterId && d.CampaignName != null)
            .Select(d => d.CampaignName)
            .Distinct()
            .ToListAsync();

        return Ok(new { totalGiven, donationCount, allocations, campaigns });
    }

    [HttpGet("overview")]
    public async Task<ActionResult> GetOverview()
    {
        var totalResidents = await _db.Residents.CountAsync(r => r.CaseStatus == "Active");
        var totalSessions = await _db.ProcessRecordings.CountAsync();
        var totalDonations = await _db.Donations.SumAsync(d => (double?)d.Amount) ?? 0;
        var activeSafehouses = await _db.Safehouses.CountAsync(s => s.Status == "Active");

        return Ok(new { totalResidents, totalSessions, totalDonations, activeSafehouses });
    }
}
