using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupportersController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public SupportersController(HavenBridgeContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supporter>>> GetAll()
    {
        return await _db.Supporters
            .Include(s => s.Donations)
            .OrderBy(s => s.DisplayName)
            .ToListAsync();
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
    public async Task<IActionResult> Update(int id, Supporter supporter)
    {
        if (id != supporter.SupporterId) return BadRequest();
        _db.Entry(supporter).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
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
