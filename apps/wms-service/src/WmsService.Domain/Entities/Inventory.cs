using WmsService.Domain.Enums;

namespace WmsService.Domain.Entities;

public sealed class Inventory : BaseEntity
{
    public string DocumentNumber { get; private set; } = string.Empty;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public InventoryStatus Status { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;

    public ICollection<InventoryItem> Items { get; private set; } = new List<InventoryItem>();

    private Inventory() { } // EF Core

    public Inventory(string documentNumber, Guid warehouseId, string createdBy)
    {
        DocumentNumber = documentNumber ?? throw new ArgumentNullException(nameof(documentNumber));
        WarehouseId = warehouseId;
        CreatedBy = createdBy ?? throw new ArgumentNullException(nameof(createdBy));
        Status = InventoryStatus.Planned;
    }

    public void Start()
    {
        if (Status != InventoryStatus.Planned)
            throw new InvalidOperationException("Only planned inventories can be started");

        Status = InventoryStatus.InProgress;
        StartedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != InventoryStatus.InProgress)
            throw new InvalidOperationException("Only in-progress inventories can be completed");

        Status = InventoryStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == InventoryStatus.Completed)
            throw new InvalidOperationException("Completed inventories cannot be cancelled");

        Status = InventoryStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }
}
