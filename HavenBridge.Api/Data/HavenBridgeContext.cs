using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using HavenBridge.Api.Models;

namespace HavenBridge.Api.Data;

public class HavenBridgeContext : DbContext
{
    public HavenBridgeContext(DbContextOptions<HavenBridgeContext> options) : base(options) { }

    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<ProcessRecording> ProcessRecordings => Set<ProcessRecording>();
    public DbSet<InterventionPlan> InterventionPlans => Set<InterventionPlan>();
    public DbSet<HomeVisitation> HomeVisitations => Set<HomeVisitation>();
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords => Set<HealthWellbeingRecord>();
    public DbSet<EducationRecord> EducationRecords => Set<EducationRecord>();
    public DbSet<IncidentReport> IncidentReports => Set<IncidentReport>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();
    public DbSet<InKindDonationItem> InKindDonationItems => Set<InKindDonationItem>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PartnerAssignment> PartnerAssignments => Set<PartnerAssignment>();
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics => Set<SafehouseMonthlyMetric>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
        // "Whenever you see a 'bool' in ANY of my C# models, map it to a 'byte' in the database."
        configurationBuilder.Properties<bool>().HaveConversion<byte>();
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<IncidentReport>()
            .HasOne(ir => ir.Resident)
            .WithMany(r => r.IncidentReports)
            .HasForeignKey(ir => ir.ResidentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<IncidentReport>()
            .HasOne(ir => ir.Safehouse)
            .WithMany(s => s.IncidentReports)
            .HasForeignKey(ir => ir.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DonationAllocation>()
            .HasOne(da => da.Safehouse)
            .WithMany(s => s.DonationAllocations)
            .HasForeignKey(da => da.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Supporter)
            .WithMany(s => s.Users)
            .HasForeignKey(u => u.SupporterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<IncidentReport>()
            .HasOne(ir => ir.User)
            .WithMany(u => u.IncidentReports)
            .HasForeignKey(ir => ir.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProcessRecording>()
            .HasOne(pr => pr.SocialWorker)
            .WithMany(u => u.ProcessRecordings)
            .HasForeignKey(pr => pr.SocialWorkerId)
            .OnDelete(DeleteBehavior.Restrict);

        // MySQL TEXT column types for long-content fields
        modelBuilder.Entity<ProcessRecording>(e =>
        {
            e.Property(p => p.SessionNarrative).HasColumnType("text");
            e.Property(p => p.InterventionsApplied).HasColumnType("text");
            e.Property(p => p.FollowUpActions).HasColumnType("text");
        });

        modelBuilder.Entity<HomeVisitation>(e =>
        {
            e.Property(p => p.Observations).HasColumnType("text");
            e.Property(p => p.FollowUpNotes).HasColumnType("text");
            e.Property(p => p.Purpose).HasColumnType("text");
        });

        modelBuilder.Entity<InterventionPlan>(e =>
        {
            e.Property(p => p.PlanDescription).HasColumnType("text");
            e.Property(p => p.ServicesProvided).HasColumnType("text");
        });

        modelBuilder.Entity<IncidentReport>(e =>
        {
            e.Property(p => p.Description).HasColumnType("text");
            e.Property(p => p.ResponseTaken).HasColumnType("text");
        });

        modelBuilder.Entity<Resident>(e =>
        {
            e.Property(p => p.InitialCaseAssessment).HasColumnType("text");
        });

        modelBuilder.Entity<PublicImpactSnapshot>(e =>
        {
            e.Property(p => p.SummaryText).HasColumnType("text");
            e.Property(p => p.MetricPayloadJson).HasColumnType("text");
        });

        modelBuilder.Entity<SocialMediaPost>(e =>
        {
            e.Property(p => p.Caption).HasColumnType("text");
            e.Property(p => p.Hashtags).HasColumnType("text");
            e.Property(p => p.PostUrl).HasColumnType("text");
        });

        modelBuilder.Entity<Safehouse>(e =>
        {
            e.Property(p => p.Notes).HasColumnType("text");
        });

        modelBuilder.Entity<Donation>(e =>
        {
            e.Property(p => p.Notes).HasColumnType("text");
        });

        // Oracle MySQL provider returns DATE columns as DateTime; convert to/from DateOnly
        var dateOnlyConverter = new ValueConverter<DateOnly, DateTime>(
            d => d.ToDateTime(TimeOnly.MinValue),
            dt => DateOnly.FromDateTime(dt));
        var nullableDateOnlyConverter = new ValueConverter<DateOnly?, DateTime?>(
            d => d.HasValue ? d.Value.ToDateTime(TimeOnly.MinValue) : null,
            dt => dt.HasValue ? DateOnly.FromDateTime(dt.Value) : null);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateOnly))
                    property.SetValueConverter(dateOnlyConverter);
                else if (property.ClrType == typeof(DateOnly?))
                    property.SetValueConverter(nullableDateOnlyConverter);
            }
        }
    }
}
