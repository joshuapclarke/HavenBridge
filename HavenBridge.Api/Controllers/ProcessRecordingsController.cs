using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProcessRecordingsController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public ProcessRecordingsController(HavenBridgeContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProcessRecording>>> GetByResident([FromQuery] int? residentId)
    {
        var query = _db.ProcessRecordings.AsQueryable();
        if (residentId.HasValue)
            query = query.Where(p => p.ResidentId == residentId.Value);

        return await query.OrderByDescending(p => p.SessionDate).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ProcessRecording>> Create(ProcessRecording recording)
    {
        _db.ProcessRecordings.Add(recording);
        await _db.SaveChangesAsync();
        return CreatedAtAction(null, new { id = recording.RecordingId }, recording);
    }
}
