using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;
using HavenBridge.Api.Utils;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    public AdminController(HavenBridgeContext db) => _db = db;
    
    private static string? ValidatePasswordStrength(string password)
    {
        if (password.Length < 14) return "Password must be at least 14 characters.";
        if (!Regex.IsMatch(password, "[A-Z]")) return "Password must contain an uppercase letter.";
        if (!Regex.IsMatch(password, "[a-z]")) return "Password must contain a lowercase letter.";
        if (!Regex.IsMatch(password, @"\d")) return "Password must contain a number.";
        if (!Regex.IsMatch(password, @"[^A-Za-z0-9]")) return "Password must contain a special character.";
        return null;
    }

    [HttpGet("search")]
    public async Task<ActionResult> Search([FromQuery] string q)
    {
        q = InputSanitizer.Clean(q, 200) ?? string.Empty;
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
    public async Task<ActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Users
            .Include(u => u.Role)
            .OrderBy(u => u.UserId)
            .Select(u => new
            {
                u.UserId,
                u.Username,
                u.UserFirstName,
                u.UserLastName,
                u.RoleId,
                Role = u.Role!.Description,
                u.NeedPasswordReset
            });

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    public record UpdateRoleRequest(int RoleId);
    public record SetPasswordResetRequest(bool NeedPasswordReset);
    public record CreateUserRequest(string Username, string Password, int RoleId, string? FirstName, string? LastName);

    [HttpPost("users")]
    public async Task<ActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Username and password are required." });

        if (req.RoleId < 1 || req.RoleId > 3)
            return BadRequest(new { message = "Role ID must be 1 (Admin), 2 (Staff), or 3 (Donor)." });

        var pwError = ValidatePasswordStrength(req.Password);
        if (pwError != null)
            return BadRequest(new { message = pwError });

        var exists = await _db.Users.AnyAsync(u => u.Username == req.Username);
        if (exists)
            return Conflict(new { message = "Username is already taken." });

        var user = new User
        {
            Username = InputSanitizer.Clean(req.Username, 100) ?? req.Username.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            RoleId = req.RoleId,
            UserFirstName = InputSanitizer.Clean(req.FirstName, 100),
            UserLastName = InputSanitizer.Clean(req.LastName, 100),
            IsSocialWorker = req.RoleId == 2,
            NeedPasswordReset = false,
            SupporterId = null
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var role = await _db.Roles.FindAsync(user.RoleId);

        return Ok(new
        {
            user.UserId,
            user.Username,
            user.UserFirstName,
            user.UserLastName,
            user.RoleId,
            Role = role?.Description ?? "Unknown",
            user.NeedPasswordReset
        });
    }

    [HttpPut("users/{id}/require-password-reset")]
    public async Task<ActionResult> SetPasswordReset(int id, [FromBody] SetPasswordResetRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        user.NeedPasswordReset = req.NeedPasswordReset;
        await _db.SaveChangesAsync();

        return Ok(new { message = req.NeedPasswordReset ? "User must reset password on next login." : "Password reset flag cleared." });
    }

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

    [HttpDelete("users/{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (id == currentUserId)
            return BadRequest(new { message = "You cannot delete your own account." });

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully." });
    }
}
