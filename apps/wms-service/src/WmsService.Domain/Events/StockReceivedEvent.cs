using WmsService.Domain.Entities;

namespace WmsService.Domain.Events;

public sealed class StockReceivedEvent : DomainEvent
{
    public Guid BatchId { get; }
    public Guid ProductId { get; }
    public Guid WarehouseId { get; }
    public decimal Quantity { get; }
    public DateTime? ExpirationDate { get; }

    public StockReceivedEvent(Batch batch, decimal quantity)
    {
        BatchId = batch.Id;
        ProductId = batch.ProductId;
        WarehouseId = batch.WarehouseId;
        Quantity = quantity;
        ExpirationDate = batch.ExpirationDate;
    }
}
