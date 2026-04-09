using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
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

    private static string? ValidatePasswordStrength(string password)
    {
        if (password.Length < 14) return "Password must be at least 14 characters.";
        if (!Regex.IsMatch(password, "[A-Z]")) return "Password must contain an uppercase letter.";
        if (!Regex.IsMatch(password, "[a-z]")) return "Password must contain a lowercase letter.";
        if (!Regex.IsMatch(password, @"\d")) return "Password must contain a number.";
        if (!Regex.IsMatch(password, @"[^A-Za-z0-9]")) return "Password must contain a special character.";
        return null;
    }

    public record RegisterRequest(string Username, string Password, string? FirstName, string? LastName);
    public record LoginRequest(string Username, string Password);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest req)
    {
        var normalizedUsername = req.Username?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedUsername) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Username and password are required." });

        var pwError = ValidatePasswordStrength(req.Password);
        if (pwError != null)
            return BadRequest(new { message = pwError });

        var exists = await _db.Users.AnyAsync(u => u.Username == normalizedUsername);
        if (exists)
            return Conflict(new { message = "Username is already taken." });

        var donorRole = await _db.Roles.FirstOrDefaultAsync(r => r.RoleId == 3);
        if (donorRole == null)
            return StatusCode(500, new { message = "Required role data is missing (Donor role)." });

        var user = new User
        {
            RoleId = 3,
            SupporterId = null,
            Supporter = null,
            Username = normalizedUsername,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            UserFirstName = req.FirstName,
            UserLastName = req.LastName,
            IsSocialWorker = false,
            NeedPasswordReset = false
        };

        _db.Users.Add(user);
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            if (message.Contains("duplicate", StringComparison.OrdinalIgnoreCase) ||
                message.Contains("unique", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { message = "Username is already taken." });
            }

            return StatusCode(500, new { message = "Unable to create user record.", detail = message });
        }

        string token;
        try
        {
            token = GenerateToken(user, donorRole.Description);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "User was created, but token generation failed.", detail = ex.Message });
        }

        return Ok(new
        {
            token,
            user = new { user.UserId, user.Username, user.UserFirstName, user.UserLastName, role = donorRole.Description, user.SupporterId }
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == req.Username);
        if (user == null)
            return Unauthorized(new { message = "Invalid username or password." });

        try
        {
            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid username or password." });
        }
        catch
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

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

        var newPwError = ValidatePasswordStrength(req.NewPassword);
        if (newPwError != null)
            return BadRequest(new { message = newPwError });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.NeedPasswordReset = false;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    public record CreateDonorProfileRequest(string? Email, string? Phone, string? Region, string? Country);

    [Authorize]
    [HttpPost("create-donor-profile")]
    public async Task<ActionResult> CreateDonorProfile([FromBody] CreateDonorProfileRequest? req)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == int.Parse(userIdClaim));
        if (user == null) return NotFound();
        if (user.SupporterId.HasValue)
            return Conflict(new { message = "Donor profile already exists." });

        var displayName = string.Join(" ",
            new[] { user.UserFirstName, user.UserLastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
        if (string.IsNullOrWhiteSpace(displayName))
            displayName = user.Username;

        var supporter = new Supporter
        {
            SupporterType = "Individual",
            DisplayName = displayName,
            FirstName = user.UserFirstName,
            LastName = user.UserLastName,
            Email = req?.Email?.Trim(),
            Phone = req?.Phone?.Trim(),
            Region = req?.Region?.Trim(),
            Country = req?.Country?.Trim(),
            Status = "Active",
            AcquisitionChannel = "Self-Registration",
            CreatedAt = DateTime.UtcNow
        };
        _db.Supporters.Add(supporter);
        await _db.SaveChangesAsync();

        user.SupporterId = supporter.SupporterId;
        await _db.SaveChangesAsync();

        var token = GenerateToken(user, user.Role!.Description);
        return Ok(new { token, supporterId = supporter.SupporterId });
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
