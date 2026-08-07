namespace WmsService.Domain.Events;

public sealed class InventoryFinishedEvent : DomainEvent
{
    public Guid InventoryId { get; }
    public Guid WarehouseId { get; }
    public int TotalItems { get; }
    public int MatchedItems { get; }
    public int DiscrepancyItems { get; }

    public InventoryFinishedEvent(Guid inventoryId, Guid warehouseId, int totalItems, int matchedItems, int discrepancyItems)
    {
        InventoryId = inventoryId;
        WarehouseId = warehouseId;
        TotalItems = totalItems;
        MatchedItems = matchedItems;
        DiscrepancyItems = discrepancyItems;
    }
}
