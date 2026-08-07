namespace WmsService.Domain.Entities;

public sealed class InventoryItem : BaseEntity
{
    public Guid InventoryId { get; private set; }
    public Inventory Inventory { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid? BatchId { get; private set; }
    public Batch? Batch { get; private set; }
    public decimal ExpectedQuantity { get; private set; }
    public decimal ActualQuantity { get; private set; }
    public bool IsMatched { get; private set; }

    private InventoryItem() { } // EF Core

    public InventoryItem(Guid inventoryId, Guid productId, decimal expectedQuantity, Guid? batchId = null)
    {
        InventoryId = inventoryId;
        ProductId = productId;
        ExpectedQuantity = expectedQuantity;
        ActualQuantity = 0;
        BatchId = batchId;
        IsMatched = false;
    }

    public void SetActualQuantity(decimal actualQuantity)
    {
        ActualQuantity = actualQuantity;
        IsMatched = ExpectedQuantity == actualQuantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public decimal Difference => ActualQuantity - ExpectedQuantity;
}
