using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class HomeVisitationsController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public HomeVisitationsController(HavenBridgeContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HomeVisitation>>> GetByResident([FromQuery] int? residentId)
    {
        var query = _db.HomeVisitations.AsQueryable();
        if (residentId.HasValue)
            query = query.Where(h => h.ResidentId == residentId.Value);

        return await query.OrderByDescending(h => h.VisitDate).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<HomeVisitation>> Create(HomeVisitation visitation)
    {
        _db.HomeVisitations.Add(visitation);
        await _db.SaveChangesAsync();
        return CreatedAtAction(null, new { id = visitation.VisitationId }, visitation);
    }
}
