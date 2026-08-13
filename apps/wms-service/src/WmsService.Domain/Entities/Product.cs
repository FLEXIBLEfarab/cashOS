namespace WmsService.Domain.Entities;

public sealed class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? Unit { get; set; }
    public decimal? MinStockLevel { get; set; }
}
