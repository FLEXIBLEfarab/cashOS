namespace WmsService.Domain.Entities;

/// <summary>
/// Сезонная цена на товар на определённый период. WarehouseId = null означает,
/// что цена действует на всех складах.
/// </summary>
public sealed class SeasonalPriceList : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid? WarehouseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;

    public Product? Product { get; set; }
    public Warehouse? Warehouse { get; set; }
}
