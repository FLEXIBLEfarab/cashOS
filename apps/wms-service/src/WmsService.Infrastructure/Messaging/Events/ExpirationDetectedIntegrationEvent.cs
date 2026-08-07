namespace WmsService.Infrastructure.Messaging.Events;

public sealed class ExpirationDetectedIntegrationEvent : IntegrationEvent
{
    public Guid BatchId { get; set; }
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public DateTime ExpirationDate { get; set; }
    public bool IsExpired { get; set; }
    public int? DaysUntilExpiration { get; set; }
}
