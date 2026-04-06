using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("SAFEHOUSES")]
public class Safehouse
{
    [Key]
    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("safehouse_code")]
    [MaxLength(50)]
    public string SafehouseCode { get; set; } = string.Empty;

    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column("region")]
    [MaxLength(100)]
    public string? Region { get; set; }

    [Column("city")]
    [MaxLength(100)]
    public string? City { get; set; }

    [Column("province")]
    [MaxLength(100)]
    public string? Province { get; set; }

    [Column("country")]
    [MaxLength(100)]
    public string? Country { get; set; }

    [Column("open_date")]
    public DateOnly? OpenDate { get; set; }

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Active";

    [Column("capacity_girls")]
    public int CapacityGirls { get; set; }

    [Column("capacity_staff")]
    public int CapacityStaff { get; set; }

    [Column("current_occupancy")]
    public int CurrentOccupancy { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation
    public ICollection<Resident> Residents { get; set; } = [];
    public ICollection<IncidentReport> IncidentReports { get; set; } = [];
    public ICollection<DonationAllocation> DonationAllocations { get; set; } = [];
    public ICollection<PartnerAssignment> PartnerAssignments { get; set; } = [];
    public ICollection<SafehouseMonthlyMetric> MonthlyMetrics { get; set; } = [];
}
