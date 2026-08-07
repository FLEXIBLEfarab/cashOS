namespace WmsService.Infrastructure.Messaging.Events;

public sealed class StockWrittenOffIntegrationEvent : IntegrationEvent
{
    public Guid WriteOffId { get; set; }
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
}
