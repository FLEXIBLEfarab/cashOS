using WmsService.Domain.Enums;

namespace WmsService.Domain.Entities;

public sealed class WriteOff : BaseEntity
{
    public string DocumentNumber { get; private set; } = string.Empty;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public WriteOffReason Reason { get; private set; }
    public WriteOffStatus Status { get; private set; }
    public decimal TotalQuantity { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;
    public string? ApprovedBy { get; private set; }

    public ICollection<WriteOffItem> Items { get; private set; } = new List<WriteOffItem>();

    private WriteOff() { } // EF Core

    public WriteOff(string documentNumber, Guid warehouseId, WriteOffReason reason, string createdBy)
    {
        DocumentNumber = documentNumber ?? throw new ArgumentNullException(nameof(documentNumber));
        WarehouseId = warehouseId;
        Reason = reason;
        CreatedBy = createdBy ?? throw new ArgumentNullException(nameof(createdBy));
        Status = WriteOffStatus.Draft;
        TotalQuantity = 0;
    }

    public void AddItem(WriteOffItem item)
    {
        Items.Add(item);
        TotalQuantity += item.Quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(string approvedBy)
    {
        if (Status != WriteOffStatus.Draft)
            throw new InvalidOperationException("Only draft write-offs can be approved");

        Status = WriteOffStatus.Approved;
        ApprovedBy = approvedBy ?? throw new ArgumentNullException(nameof(approvedBy));
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != WriteOffStatus.Draft)
            throw new InvalidOperationException("Only draft write-offs can be rejected");

        Status = WriteOffStatus.Rejected;
        UpdatedAt = DateTime.UtcNow;
    }
}
