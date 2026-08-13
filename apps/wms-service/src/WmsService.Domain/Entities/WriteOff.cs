namespace WmsService.Domain.Entities;

public sealed class WriteOff : BaseEntity
{
    public string DocumentNumber { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public string Reason { get; set; } = string.Empty;
    public DateTime DocumentDate { get; set; }
    public ICollection<WriteOffItem> Items { get; set; } = new List<WriteOffItem>();
}
