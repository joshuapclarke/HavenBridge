using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("EDUCATION_RECORDS")]
public class EducationRecord
{
    [Key]
    [Column("education_record_id")]
    public int EducationRecordId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly RecordDate { get; set; }

    [Column("education_level")]
    [MaxLength(100)]
    public string? EducationLevel { get; set; }

    [Column("school_name")]
    [MaxLength(300)]
    public string? SchoolName { get; set; }

    [Column("enrollment_status")]
    [MaxLength(50)]
    public string? EnrollmentStatus { get; set; }

    [Column("attendance_rate")]
    public float? AttendanceRate { get; set; }

    [Column("progress_percent")]
    public float? ProgressPercent { get; set; }

    [Column("completion_status")]
    [MaxLength(50)]
    public string? CompletionStatus { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}
