namespace WmsService.Domain.Entities;

public sealed class InventoryItem : BaseEntity
{
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal ExpectedQuantity { get; set; }
    public decimal? ActualQuantity { get; set; }
    public decimal? Difference => ActualQuantity.HasValue ? ActualQuantity.Value - ExpectedQuantity : null;
}
