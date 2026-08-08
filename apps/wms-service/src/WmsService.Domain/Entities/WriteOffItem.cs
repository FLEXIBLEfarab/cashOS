namespace WmsService.Domain.Entities;

public sealed class WriteOffItem : BaseEntity
{
    public Guid WriteOffId { get; set; }
    public WriteOff WriteOff { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid? BatchId { get; set; }
    public Batch? Batch { get; set; }
    public decimal Quantity { get; set; }
    public string? Reason { get; set; }
}
