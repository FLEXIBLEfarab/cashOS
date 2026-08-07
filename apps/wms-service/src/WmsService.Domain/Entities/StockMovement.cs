using WmsService.Domain.Enums;

namespace WmsService.Domain.Entities;

public sealed class StockMovement : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public Guid? BatchId { get; private set; }
    public Batch? Batch { get; private set; }
    public MovementType MovementType { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? UnitPrice { get; private set; }
    public decimal? TotalAmount { get; private set; }
    public string DocumentId { get; private set; } = string.Empty;
    public string DocumentType { get; private set; } = string.Empty;
    public string? Reason { get; private set; }
    public string PerformedBy { get; private set; } = string.Empty;
    public DateTime PerformedAt { get; private set; }
    public Guid? SourceWarehouseId { get; private set; }
    public Guid? DestinationWarehouseId { get; private set; }

    private StockMovement() { } // EF Core

    public StockMovement(
        Guid productId,
        Guid warehouseId,
        MovementType movementType,
        decimal quantity,
        string documentId,
        string documentType,
        string performedBy,
        Guid? batchId = null,
        decimal? unitPrice = null,
        decimal? totalAmount = null,
        string? reason = null,
        Guid? sourceWarehouseId = null,
        Guid? destinationWarehouseId = null)
    {
        ProductId = productId;
        WarehouseId = warehouseId;
        MovementType = movementType;
        Quantity = quantity;
        DocumentId = documentId ?? throw new ArgumentNullException(nameof(documentId));
        DocumentType = documentType ?? throw new ArgumentNullException(nameof(documentType));
        PerformedBy = performedBy ?? throw new ArgumentNullException(nameof(performedBy));
        BatchId = batchId;
        UnitPrice = unitPrice;
        TotalAmount = totalAmount;
        Reason = reason;
        SourceWarehouseId = sourceWarehouseId;
        DestinationWarehouseId = destinationWarehouseId;
        PerformedAt = DateTime.UtcNow;
    }
}
