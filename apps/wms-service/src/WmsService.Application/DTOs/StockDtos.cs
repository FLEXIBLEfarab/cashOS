namespace WmsService.Application.DTOs;

public sealed record StockDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string ProductBarcode { get; init; } = string.Empty;
    public Guid WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal ReservedQuantity { get; init; }
    public decimal AvailableQuantity { get; init; }
}

public sealed record StockMovementDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public Guid WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
    public string MovementType { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string DocumentId { get; init; } = string.Empty;
    public string DocumentType { get; init; } = string.Empty;
    public string? Reason { get; init; }
    public string PerformedBy { get; init; } = string.Empty;
    public DateTime PerformedAt { get; init; }
}

public sealed record ReceiveStockRequest
{
    public Guid WarehouseId { get; init; }
    public string DocumentNumber { get; init; } = string.Empty;
    public Guid? SupplierId { get; init; }
    public List<ReceiveStockItemRequest> Items { get; init; } = new();
    public string CreatedBy { get; init; } = string.Empty;
}

public sealed record ReceiveStockItemRequest
{
    public Guid ProductId { get; init; }
    public decimal Quantity { get; init; }
    public decimal? UnitPrice { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public DateTime? ProductionDate { get; init; }
    public string? BatchNumber { get; init; }
}

public sealed record WriteOffStockRequest
{
    public Guid WarehouseId { get; init; }
    public string DocumentNumber { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public List<WriteOffStockItemRequest> Items { get; init; } = new();
    public string CreatedBy { get; init; } = string.Empty;
}

public sealed record WriteOffStockItemRequest
{
    public Guid ProductId { get; init; }
    public Guid BatchId { get; init; }
    public decimal Quantity { get; init; }
    public string? Reason { get; init; }
}

public sealed record MoveStockRequest
{
    public Guid ProductId { get; init; }
    public Guid SourceWarehouseId { get; init; }
    public Guid DestinationWarehouseId { get; init; }
    public Guid? BatchId { get; init; }
    public decimal Quantity { get; init; }
    public string DocumentNumber { get; init; } = string.Empty;
    public string PerformedBy { get; init; } = string.Empty;
}

public sealed record AdjustStockRequest
{
    public Guid ProductId { get; init; }
    public Guid WarehouseId { get; init; }
    public decimal NewQuantity { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string PerformedBy { get; init; } = string.Empty;
}
