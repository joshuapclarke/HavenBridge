using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HavenBridge.Api.Data;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly HavenBridgeContext _db;
    private readonly IConfiguration _config;

    public AuthController(HavenBridgeContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public record RegisterRequest(string Username, string Password, string? FirstName, string? LastName);
    public record LoginRequest(string Username, string Password);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Username and password are required." });

        if (req.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        var exists = await _db.Users.AnyAsync(u => u.Username == req.Username);
        if (exists)
            return Conflict(new { message = "Username is already taken." });

        var displayName = string.Join(" ",
            new[] { req.FirstName, req.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
        if (string.IsNullOrWhiteSpace(displayName))
            displayName = req.Username;

        var supporter = new Supporter
        {
            SupporterType = "Individual",
            DisplayName = displayName,
            FirstName = req.FirstName,
            LastName = req.LastName,
            Status = "Active",
            AcquisitionChannel = "Self-Registration",
            FirstDonationDate = null,
            CreatedAt = DateTime.UtcNow
        };
        _db.Supporters.Add(supporter);
        await _db.SaveChangesAsync();

        var user = new User
        {
            RoleId = 3,
            SupporterId = supporter.SupporterId,
            Username = req.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            UserFirstName = req.FirstName,
            UserLastName = req.LastName,
            IsSocialWorker = false
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var role = await _db.Roles.FindAsync(user.RoleId);
        var token = GenerateToken(user, role!.Description);

        return Ok(new
        {
            token,
            user = new { user.UserId, user.Username, user.UserFirstName, user.UserLastName, role = role.Description, user.SupporterId }
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == req.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        var token = GenerateToken(user, user.Role!.Description);

        return Ok(new
        {
            token,
            needPasswordReset = user.NeedPasswordReset,
            user = new { user.UserId, user.Username, user.UserFirstName, user.UserLastName, role = user.Role.Description, user.SupporterId }
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var user = await _db.Users.FindAsync(int.Parse(userIdClaim));
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        if (req.NewPassword.Length < 6)
            return BadRequest(new { message = "New password must be at least 6 characters." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.NeedPasswordReset = false;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == int.Parse(userIdClaim));
        if (user == null) return NotFound();

        return Ok(new
        {
            user.UserId,
            user.Username,
            user.UserFirstName,
            user.UserLastName,
            role = user.Role!.Description,
            user.SupporterId
        });
    }

    private string GenerateToken(User user, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, role)
        };

        if (user.SupporterId.HasValue)
            claims.Add(new Claim("supporterId", user.SupporterId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
