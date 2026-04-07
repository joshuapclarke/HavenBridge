using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HavenBridge.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3306;Database=havenbridge;User=root;Password=HavenBridge2026!;";

builder.Services.AddDbContext<HavenBridgeContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

var allowedOrigins = new List<string>
{
    "http://localhost:5173",
    "https://icy-wave-0fc91c01e2.azurestaticapps.net"
};
var azureOrigin = Environment.GetEnvironmentVariable("AZURE_FRONTEND_URL");
if (!string.IsNullOrWhiteSpace(azureOrigin))
    allowedOrigins.Add(azureOrigin);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HavenBridgeContext>();
    db.Database.EnsureCreated();

    var seedFolder = Path.Combine(AppContext.BaseDirectory, "SeedData");
    if (Directory.Exists(seedFolder))
    {
        await CsvDataImporter.ImportAllAsync(db, seedFolder);
    }

    await db.Database.ExecuteSqlRawAsync(
        "UPDATE PUBLIC_IMPACT_SNAPSHOTS SET is_published = 0 WHERE snapshot_date >= '2026-03-01' AND is_published = 1");

    var defaultHash = BCrypt.Net.BCrypt.HashPassword("password123");
    var usersToFix = db.Users.AsEnumerable()
        .Where(u =>
        {
            if (string.IsNullOrWhiteSpace(u.PasswordHash)) return true;
            try { BCrypt.Net.BCrypt.Verify("test", u.PasswordHash); return false; }
            catch { return true; }
        })
        .ToList();

    if (usersToFix.Count > 0)
    {
        foreach (var u in usersToFix)
        {
            u.PasswordHash = defaultHash;
            u.NeedPasswordReset = true;
        }
        await db.SaveChangesAsync();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.Use(async (ctx, next) =>
{
    ctx.Response.Headers.Append("Content-Security-Policy",
        "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'");
    ctx.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    ctx.Response.Headers.Append("X-Frame-Options", "DENY");
    ctx.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
