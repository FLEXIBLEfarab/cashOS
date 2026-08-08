namespace WmsService.Domain.Entities;

public sealed class ReceivingDocument : BaseEntity
{
    public string DocumentNumber { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public Guid? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public DateTime DocumentDate { get; set; }
    public ICollection<ReceivingDocumentItem> Items { get; set; } = new List<ReceivingDocumentItem>();
}
