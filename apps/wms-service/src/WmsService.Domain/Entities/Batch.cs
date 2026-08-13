namespace WmsService.Domain.Entities;

public sealed class Batch : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public string BatchNumber { get; private set; } = string.Empty;
    public DateTime? ProductionDate { get; private set; }
    public DateTime? ExpirationDate { get; private set; }
    public decimal InitialQuantity { get; private set; }
    public decimal CurrentQuantity { get; private set; }
    public bool IsBlocked { get; private set; }
    public string? BlockedReason { get; private set; }
    public Guid? SupplierId { get; private set; }
    public Supplier? Supplier { get; private set; }
    public DateTime ReceivedAt { get; private set; }
    public ICollection<StockMovement> StockMovements { get; private set; } = new List<StockMovement>();

    private Batch() { }

    public Batch(Guid productId, Guid warehouseId, string batchNumber, decimal initialQuantity,
                 DateTime? expirationDate, DateTime? productionDate, Guid? supplierId)
    {
        ProductId = productId;
        WarehouseId = warehouseId;
        BatchNumber = batchNumber ?? throw new ArgumentNullException(nameof(batchNumber));
        InitialQuantity = initialQuantity;
        CurrentQuantity = initialQuantity;
        ExpirationDate = expirationDate;
        ProductionDate = productionDate;
        SupplierId = supplierId;
        ReceivedAt = DateTime.UtcNow;
        IsBlocked = false;
    }

    public void Block(string reason)
    {
        IsBlocked = true;
        BlockedReason = reason ?? throw new ArgumentNullException(nameof(reason));
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unblock()
    {
        IsBlocked = false;
        BlockedReason = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReduceQuantity(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        if (amount > CurrentQuantity)
            throw new InvalidOperationException("Cannot reduce more than current quantity");
        CurrentQuantity -= amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void IncreaseQuantity(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        CurrentQuantity += amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
