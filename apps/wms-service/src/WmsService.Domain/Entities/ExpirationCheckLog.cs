namespace WmsService.Domain.Entities;

public sealed class ExpirationCheckLog : BaseEntity
{
    public Guid BatchId { get; private set; }
    public Batch Batch { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public DateTime CheckDate { get; private set; }
    public int? DaysUntilExpiration { get; private set; }
    public bool IsExpired { get; private set; }
    public bool IsExpiringSoon { get; private set; }
    public string? ActionTaken { get; private set; }

    private ExpirationCheckLog() { } // EF Core

    public ExpirationCheckLog(Guid batchId, Guid productId, Guid warehouseId, DateTime checkDate, int? daysUntilExpiration, bool isExpired, bool isExpiringSoon, string? actionTaken = null)
    {
        BatchId = batchId;
        ProductId = productId;
        WarehouseId = warehouseId;
        CheckDate = checkDate;
        DaysUntilExpiration = daysUntilExpiration;
        IsExpired = isExpired;
        IsExpiringSoon = isExpiringSoon;
        ActionTaken = actionTaken;
    }
}
