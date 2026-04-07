using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class UsersController : ControllerBase
{
    private readonly HavenBridgeContext _db;

    public UsersController(HavenBridgeContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        // Returns all users so the frontend can filter by isSocialWorker
        return await _db.Users
            .OrderBy(u => u.UserLastName)
            .ToListAsync();
    }

    // Optional: A specific endpoint just for social workers
    [HttpGet("social-workers")]
    public async Task<ActionResult<IEnumerable<User>>> GetSocialWorkers()
    {
        return await _db.Users
            .Where(u => u.IsSocialWorker)
            .OrderBy(u => u.UserLastName)
            .ToListAsync();
    }
}