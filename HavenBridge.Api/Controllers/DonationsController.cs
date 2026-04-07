using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DonationsController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public DonationsController(HavenBridgeContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Donation>>> GetAll([FromQuery] int? supporterId)
    {
        var query = _db.Donations.Include(d => d.Supporter).AsQueryable();
        if (supporterId.HasValue)
            query = query.Where(d => d.SupporterId == supporterId.Value);

        return await query.OrderByDescending(d => d.DonationDate).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Donation>> Create(Donation donation)
    {
        _db.Donations.Add(donation);
        await _db.SaveChangesAsync();
        return CreatedAtAction(null, new { id = donation.DonationId }, donation);
    }
}
