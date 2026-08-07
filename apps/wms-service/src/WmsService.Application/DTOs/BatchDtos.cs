namespace WmsService.Application.DTOs;

public sealed record BatchDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public Guid WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
    public string BatchNumber { get; init; } = string.Empty;
    public DateTime? ProductionDate { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public decimal InitialQuantity { get; init; }
    public decimal CurrentQuantity { get; init; }
    public bool IsBlocked { get; init; }
    public string? BlockedReason { get; init; }
    public DateTime ReceivedAt { get; init; }
}

public sealed record ExpiringProductDto
{
    public Guid BatchId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string BatchNumber { get; init; } = string.Empty;
    public DateTime? ExpirationDate { get; init; }
    public int DaysUntilExpiration { get; init; }
    public decimal CurrentQuantity { get; init; }
    public Guid WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
}
