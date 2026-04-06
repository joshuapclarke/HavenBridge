using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("HEALTH_WELLBEING_RECORDS")]
public class HealthWellbeingRecord
{
    [Key]
    [Column("health_record_id")]
    public int HealthRecordId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly RecordDate { get; set; }

    [Column("general_health_score")]
    public float? GeneralHealthScore { get; set; }

    [Column("nutrition_score")]
    public float? NutritionScore { get; set; }

    [Column("sleep_quality_score")]
    public float? SleepQualityScore { get; set; }

    [Column("energy_level_score")]
    public float? EnergyLevelScore { get; set; }

    [Column("height_cm")]
    public float? HeightCm { get; set; }

    [Column("weight_kg")]
    public float? WeightKg { get; set; }

    [Column("bmi")]
    public float? Bmi { get; set; }

    [Column("medical_checkup_done")]
    public bool MedicalCheckupDone { get; set; }

    [Column("dental_checkup_done")]
    public bool DentalCheckupDone { get; set; }

    [Column("psychological_checkup_done")]
    public bool PsychologicalCheckupDone { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}
