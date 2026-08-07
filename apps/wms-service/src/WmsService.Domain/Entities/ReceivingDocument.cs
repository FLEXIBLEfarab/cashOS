using WmsService.Domain.Enums;

namespace WmsService.Domain.Entities;

public sealed class ReceivingDocument : BaseEntity
{
    public string DocumentNumber { get; private set; } = string.Empty;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public Guid? SupplierId { get; private set; }
    public Supplier? Supplier { get; private set; }
    public decimal? TotalAmount { get; private set; }
    public ReceivingStatus Status { get; private set; }
    public DateTime ReceivedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;

    public ICollection<ReceivingDocumentItem> Items { get; private set; } = new List<ReceivingDocumentItem>();

    private ReceivingDocument() { } // EF Core

    public ReceivingDocument(string documentNumber, Guid warehouseId, Guid? supplierId, string createdBy)
    {
        DocumentNumber = documentNumber ?? throw new ArgumentNullException(nameof(documentNumber));
        WarehouseId = warehouseId;
        SupplierId = supplierId;
        CreatedBy = createdBy ?? throw new ArgumentNullException(nameof(createdBy));
        Status = ReceivingStatus.Draft;
        ReceivedAt = DateTime.UtcNow;
    }

    public void Process()
    {
        if (Status != ReceivingStatus.Draft)
            throw new InvalidOperationException("Only draft documents can be processed");

        Status = ReceivingStatus.Processed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == ReceivingStatus.Processed)
            throw new InvalidOperationException("Processed documents cannot be cancelled");

        Status = ReceivingStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTotalAmount(decimal amount)
    {
        TotalAmount = amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
