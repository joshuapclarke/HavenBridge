using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("IN_KIND_DONATION_ITEMS")]
public class InKindDonationItem
{
    [Key]
    [Column("item_id")]
    public int ItemId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("item_name")]
    [MaxLength(200)]
    public string ItemName { get; set; } = string.Empty;

    [Column("item_category")]
    [MaxLength(100)]
    public string? ItemCategory { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("unit_of_measure")]
    [MaxLength(50)]
    public string? UnitOfMeasure { get; set; }

    [Column("estimated_unit_value")]
    public float? EstimatedUnitValue { get; set; }

    [Column("intended_use")]
    [MaxLength(300)]
    public string? IntendedUse { get; set; }

    [Column("received_condition")]
    [MaxLength(100)]
    public string? ReceivedCondition { get; set; }

    [ForeignKey(nameof(DonationId))]
    public Donation? Donation { get; set; }
}
