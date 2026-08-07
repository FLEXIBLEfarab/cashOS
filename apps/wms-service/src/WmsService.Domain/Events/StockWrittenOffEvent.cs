using WmsService.Domain.Entities;

namespace WmsService.Domain.Events;

public sealed class StockWrittenOffEvent : DomainEvent
{
    public Guid WriteOffId { get; }
    public Guid ProductId { get; }
    public Guid WarehouseId { get; }
    public decimal Quantity { get; }
    public string Reason { get; }

    public StockWrittenOffEvent(WriteOff writeOff, WriteOffItem item)
    {
        WriteOffId = writeOff.Id;
        ProductId = item.ProductId;
        WarehouseId = writeOff.WarehouseId;
        Quantity = item.Quantity;
        Reason = writeOff.Reason.ToString();
    }
}
