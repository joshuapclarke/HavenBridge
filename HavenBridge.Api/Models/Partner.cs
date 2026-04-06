using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("PARTNERS")]
public class Partner
{
    [Key]
    [Column("partner_id")]
    public int PartnerId { get; set; }

    [Column("partner_name")]
    [MaxLength(300)]
    public string PartnerName { get; set; } = string.Empty;

    [Column("partner_type")]
    [MaxLength(100)]
    public string? PartnerType { get; set; }

    [Column("role_type")]
    [MaxLength(100)]
    public string? RoleType { get; set; }

    [Column("contact_name")]
    [MaxLength(200)]
    public string? ContactName { get; set; }

    [Column("email")]
    [MaxLength(200)]
    public string? Email { get; set; }

    [Column("phone")]
    [MaxLength(50)]
    public string? Phone { get; set; }

    [Column("region")]
    [MaxLength(100)]
    public string? Region { get; set; }

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Active";

    [Column("start_date")]
    public DateOnly? StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    public ICollection<PartnerAssignment> Assignments { get; set; } = [];
}
