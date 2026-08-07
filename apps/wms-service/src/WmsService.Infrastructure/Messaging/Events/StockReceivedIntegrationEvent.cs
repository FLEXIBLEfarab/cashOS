namespace WmsService.Infrastructure.Messaging.Events;

public sealed class StockReceivedIntegrationEvent : IntegrationEvent
{
    public Guid BatchId { get; set; }
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal Quantity { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
}
