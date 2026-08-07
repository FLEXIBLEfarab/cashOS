namespace WmsService.Domain.Events;

public sealed class ExpirationDetectedEvent : DomainEvent
{
    public Guid BatchId { get; }
    public Guid ProductId { get; }
    public Guid WarehouseId { get; }
    public DateTime ExpirationDate { get; }
    public bool IsExpired { get; }
    public int? DaysUntilExpiration { get; }

    public ExpirationDetectedEvent(Guid batchId, Guid productId, Guid warehouseId, DateTime expirationDate, bool isExpired, int? daysUntilExpiration)
    {
        BatchId = batchId;
        ProductId = productId;
        WarehouseId = warehouseId;
        ExpirationDate = expirationDate;
        IsExpired = isExpired;
        DaysUntilExpiration = daysUntilExpiration;
    }
}
