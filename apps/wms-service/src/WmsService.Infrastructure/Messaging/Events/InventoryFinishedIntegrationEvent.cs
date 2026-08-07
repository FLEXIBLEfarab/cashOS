namespace WmsService.Infrastructure.Messaging.Events;

public sealed class InventoryFinishedIntegrationEvent : IntegrationEvent
{
    public Guid InventoryId { get; set; }
    public Guid WarehouseId { get; set; }
    public int TotalItems { get; set; }
    public int MatchedItems { get; set; }
    public int DiscrepancyItems { get; set; }
}
