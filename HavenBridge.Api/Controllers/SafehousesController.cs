using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SafehousesController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public SafehousesController(HavenBridgeContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Safehouse>>> GetAll()
    {
        return await _db.Safehouses.OrderBy(s => s.Name).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Safehouse>> Get(int id)
    {
        var safehouse = await _db.Safehouses
            .Include(s => s.Residents.Where(r => r.CaseStatus == "Active"))
            .Include(s => s.MonthlyMetrics.OrderByDescending(m => m.MonthStart).Take(6))
            .FirstOrDefaultAsync(s => s.SafehouseId == id);

        return safehouse is null ? NotFound() : Ok(safehouse);
    }
}
