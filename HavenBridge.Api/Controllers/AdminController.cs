using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public AdminController(HavenBridgeContext db) => _db = db;

    [HttpGet("recent-activity")]
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

    [HttpGet("users")]
    public async Task<ActionResult> GetUsers()
    {
        var users = await _db.Users
            .Include(u => u.Role)
            .OrderBy(u => u.UserId)
            .Select(u => new
            {
                u.UserId,
                u.Username,
                u.UserFirstName,
                u.UserLastName,
                u.RoleId,
                Role = u.Role!.Description
            })
            .ToListAsync();

        return Ok(users);
    }

    public record UpdateRoleRequest(int RoleId);

    [HttpPut("users/{id}/role")]
    public async Task<ActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest req)
    {
        if (req.RoleId < 1 || req.RoleId > 3)
            return BadRequest(new { message = "Role ID must be 1 (Admin), 2 (Staff), or 3 (Donor)." });

        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (id == currentUserId)
            return BadRequest(new { message = "You cannot change your own role." });

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        user.RoleId = req.RoleId;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Role updated successfully." });
    }
}
