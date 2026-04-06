using Microsoft.EntityFrameworkCore;
using HavenBridge.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddOpenApi();

builder.Services.AddDbContext<HavenBridgeContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=havenbridge.db"));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
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

    // Hide future snapshots that have no real health/education data
    await db.Database.ExecuteSqlRawAsync(
        "UPDATE PUBLIC_IMPACT_SNAPSHOTS SET is_published = 0 WHERE snapshot_date >= '2026-03-01' AND is_published = 1");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
