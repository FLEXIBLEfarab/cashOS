namespace WmsService.Domain.Entities;

public sealed class WriteOffItem : BaseEntity
{
    public Guid WriteOffId { get; private set; }
    public WriteOff WriteOff { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid BatchId { get; private set; }
    public Batch Batch { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public string? Reason { get; private set; }

    private WriteOffItem() { } // EF Core

    public WriteOffItem(Guid writeOffId, Guid productId, Guid batchId, decimal quantity, string? reason = null)
    {
        WriteOffId = writeOffId;
        ProductId = productId;
        BatchId = batchId;
        Quantity = quantity;
        Reason = reason;
    }
}
