using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenBridge.Api.Models;

[Table("PUBLIC_IMPACT_SNAPSHOTS")]
public class PublicImpactSnapshot
{
    [Key]
    [Column("snapshot_id")]
    public int SnapshotId { get; set; }

    [Column("snapshot_date")]
    public DateOnly SnapshotDate { get; set; }

    [Column("headline")]
    [MaxLength(300)]
    public string? Headline { get; set; }

    [Column("summary_text")]
    public string? SummaryText { get; set; }

    [Column("metric_payload_json")]
    public string? MetricPayloadJson { get; set; }

    [Column("is_published")]
    public bool IsPublished { get; set; }

    [Column("published_at")]
    public DateTime? PublishedAt { get; set; }
}
