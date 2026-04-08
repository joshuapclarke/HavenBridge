using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class ResidentsController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public ResidentsController(HavenBridgeContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Resident>>> GetAll()
    {
        return await _db.Residents
            .Include(r => r.Safehouse)
            .OrderBy(r => r.CaseStatus == "Active" ? 0 : 1)
            .ThenByDescending(r => r.DateOfAdmission)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Resident>> Get(float id)
    {
        var resident = await _db.Residents
            .Include(r => r.Safehouse)
            .Include(r => r.ProcessRecordings.OrderByDescending(p => p.SessionDate))
            .Include(r => r.InterventionPlans)
            .Include(r => r.HomeVisitations.OrderByDescending(h => h.VisitDate))
            .Include(r => r.HealthRecords.OrderByDescending(h => h.RecordDate))
            .Include(r => r.EducationRecords.OrderByDescending(e => e.RecordDate))
            .Include(r => r.IncidentReports.OrderByDescending(i => i.IncidentDate))
            .FirstOrDefaultAsync(r => r.ResidentId == id);

        return resident is null ? NotFound() : Ok(resident);
    }

    [HttpPost]
    public async Task<ActionResult<Resident>> Create(Resident resident)
    {
        resident.CreatedAt = DateTime.UtcNow;
        _db.Residents.Add(resident);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = resident.ResidentId }, resident);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Dictionary<string, object?> updates)
    {
        var existing = await _db.Residents.FindAsync(id);
        if (existing is null) return NotFound();

        var props = typeof(Resident).GetProperties()
            .Where(p => p.CanWrite)
            .ToDictionary(p => p.Name, p => p, StringComparer.OrdinalIgnoreCase);

        foreach (var kv in updates)
        {
            if (!props.TryGetValue(kv.Key, out var prop) || kv.Key.Equals("ResidentId", StringComparison.OrdinalIgnoreCase))
                continue;

            if (kv.Value is null)
            {
                prop.SetValue(existing, null);
                continue;
            }

            var target = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
            if (kv.Value is System.Text.Json.JsonElement je)
            {
                var converted = System.Text.Json.JsonSerializer.Deserialize(je.GetRawText(), target);
                prop.SetValue(existing, converted);
            }
            else
            {
                prop.SetValue(existing, Convert.ChangeType(kv.Value, target));
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("alerts")]
    public async Task<ActionResult> GetAlerts()
    {
        var highRisk = await _db.Residents
            .Where(r => r.CurrentRiskLevel == "High" && r.CaseStatus == "Active")
            .Select(r => new { r.ResidentId, r.InternalCode, r.CurrentRiskLevel, r.AssignedSocialWorker, Type = "High Risk" })
            .ToListAsync();

        var flaggedSessions = await _db.ProcessRecordings
            .Where(p => p.ConcernsFlagged)
            .OrderByDescending(p => p.SessionDate)
            .Take(10)
            .Select(p => new { p.RecordingId, p.ResidentId, p.SessionDate, p.SessionType, Type = "Concern Flagged" })
            .ToListAsync();

        var unresolvedIncidents = await _db.IncidentReports
            .Where(i => !i.Resolved)
            .OrderByDescending(i => i.IncidentDate)
            .Select(i => new { i.IncidentId, i.ResidentId, i.IncidentDate, i.Severity, i.IncidentType, Type = "Unresolved Incident" })
            .ToListAsync();

        return Ok(new { highRisk, flaggedSessions, unresolvedIncidents });
    }
}
