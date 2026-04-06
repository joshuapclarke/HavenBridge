using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("DONATION_ALLOCATIONS")]
public class DonationAllocation
{
    [Key]
    [Column("allocation_id")]
    public int AllocationId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("program_area")]
    [MaxLength(200)]
    public string? ProgramArea { get; set; }

    [Column("amount_allocated")]
    public float AmountAllocated { get; set; }

    [Column("allocation_date")]
    public DateOnly? AllocationDate { get; set; }

    [Column("allocation_notes")]
    public string? AllocationNotes { get; set; }

    [ForeignKey(nameof(DonationId))]
    public Donation? Donation { get; set; }

    [ForeignKey(nameof(SafehouseId))]
    public Safehouse? Safehouse { get; set; }
}
