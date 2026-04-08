using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportersController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public SupportersController(HavenBridgeContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Supporters
            .Include(s => s.Donations)
            .OrderBy(s => s.DisplayName);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Supporter>> Get(int id)
    {
        var supporter = await _db.Supporters
            .Include(s => s.Donations.OrderByDescending(d => d.DonationDate))
                .ThenInclude(d => d.Allocations)
            .FirstOrDefaultAsync(s => s.SupporterId == id);

        return supporter is null ? NotFound() : Ok(supporter);
    }

    [HttpPost]
    public async Task<ActionResult<Supporter>> Create(Supporter supporter)
    {
        supporter.CreatedAt = DateTime.UtcNow;
        _db.Supporters.Add(supporter);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = supporter.SupporterId }, supporter);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Dictionary<string, object?> updates)
    {
        var existing = await _db.Supporters.FindAsync(id);
        if (existing is null) return NotFound();

        var type = typeof(Supporter);
        foreach (var (key, value) in updates)
        {
            var prop = type.GetProperties()
                .FirstOrDefault(p => string.Equals(p.Name, key, StringComparison.OrdinalIgnoreCase));
            if (prop == null || !prop.CanWrite) continue;

            object? converted = value;
            if (value is System.Text.Json.JsonElement je)
            {
                if (prop.PropertyType == typeof(string) || prop.PropertyType == typeof(string))
                    converted = je.GetString();
                else if (prop.PropertyType == typeof(int) || prop.PropertyType == typeof(int?))
                    converted = je.TryGetInt32(out var i) ? i : null;
                else if (prop.PropertyType == typeof(bool))
                    converted = je.GetBoolean();
                else
                    converted = je.ToString();
            }
            prop.SetValue(existing, converted);
        }

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpPut("{id}/flag-at-risk")]
    public async Task<IActionResult> FlagAtRisk(int id)
    {
        var supporter = await _db.Supporters.FindAsync(id);
        if (supporter is null) return NotFound();
        supporter.Status = supporter.Status == "At-Risk" ? "Active" : "At-Risk";
        await _db.SaveChangesAsync();
        return Ok(supporter);
    }

    [HttpGet("summary")]
    public async Task<ActionResult> GetSummary()
    {
        var total = await _db.Supporters.CountAsync();
        var active = await _db.Supporters.CountAsync(s => s.Status == "Active");
        var atRisk = await _db.Supporters.CountAsync(s => s.Status == "At-Risk");
        var avgGift = await _db.Donations
            .Where(d => d.Amount > 0)
            .AverageAsync(d => (double?)d.Amount) ?? 0;

        return Ok(new { total, active, atRisk, avgGift = Math.Round(avgGift, 2) });
    }
}
