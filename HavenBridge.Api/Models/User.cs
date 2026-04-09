using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("USERS")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("supporter_id")]
    public int? SupporterId { get; set; }

    [Column("username")]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Column("password_hash")]
    [MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("user_first_name")]
    [MaxLength(100)]
    public string? UserFirstName { get; set; }

    [Column("user_last_name")]
    [MaxLength(100)]
    public string? UserLastName { get; set; }

    [Column("is_social_worker")]
    public bool IsSocialWorker { get; set; }

    [Column("need_password_reset")]
    public bool NeedPasswordReset { get; set; }

    [Column("is_mfa_enabled")]
    public bool IsMfaEnabled { get; set; } = false;

    [ForeignKey(nameof(RoleId))]
    public Role? Role { get; set; }

    [ForeignKey(nameof(SupporterId))]
    public Supporter? Supporter { get; set; }

    [InverseProperty(nameof(IncidentReport.User))]
    public ICollection<IncidentReport> IncidentReports { get; set; } = [];

    [InverseProperty(nameof(ProcessRecording.SocialWorker))]
    public ICollection<ProcessRecording> ProcessRecordings { get; set; } = [];
}
