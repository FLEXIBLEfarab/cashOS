namespace WmsService.Domain.Entities;

public enum InventoryStatus { Draft, InProgress, Completed, Cancelled }

public sealed class Inventory : BaseEntity
{
    public string DocumentNumber { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public InventoryStatus Status { get; set; } = InventoryStatus.Draft;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public ICollection<InventoryItem> Items { get; set; } = new List<InventoryItem>();
}
