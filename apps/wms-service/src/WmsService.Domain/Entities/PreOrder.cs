namespace WmsService.Domain.Entities;

public enum PreOrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Fulfilled = 2,
    Cancelled = 3
}

/// <summary>
/// Предзаказ товара. CustomerReference — просто строка (имя/телефон/номер брони),
/// т.к. полноценная сущность клиента живёт в CRM-модуле (зона другого разработчика,
/// NestJS), а не в WMS.
/// </summary>
public sealed class PreOrder : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public string CustomerReference { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public DateTime RequestedDate { get; set; }
    public PreOrderStatus Status { get; set; } = PreOrderStatus.Pending;
    public string? Notes { get; set; }

    public Product? Product { get; set; }
    public Warehouse? Warehouse { get; set; }
}
