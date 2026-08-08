namespace WmsService.Domain.Entities;

public sealed class Stock : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public decimal ReservedQuantity { get; private set; }
    public ICollection<StockMovement> StockMovements { get; private set; } = new List<StockMovement>();

    private Stock() { }

    public Stock(Guid productId, Guid warehouseId, decimal initialQuantity)
    {
        ProductId = productId;
        WarehouseId = warehouseId;
        Quantity = initialQuantity;
        ReservedQuantity = 0;
    }

    public decimal AvailableQuantity => Quantity - ReservedQuantity;

    public void Increase(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        Quantity += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Decrease(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        if (amount > AvailableQuantity)
            throw new InvalidOperationException("Insufficient available stock");
        Quantity -= amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reserve(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        if (amount > AvailableQuantity)
            throw new InvalidOperationException("Cannot reserve more than available");
        ReservedQuantity += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReleaseReservation(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        if (amount > ReservedQuantity)
            throw new InvalidOperationException("Cannot release more than reserved");
        ReservedQuantity -= amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
