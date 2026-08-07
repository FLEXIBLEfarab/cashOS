namespace WmsService.Application.Common.Interfaces;

public interface IRealTimeNotifier
{
    Task NotifyWarehouseUpdatedAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task NotifyStockChangedAsync(Guid productId, Guid warehouseId, decimal newQuantity, CancellationToken cancellationToken = default);
    Task NotifyNewExpiredProductAsync(Guid warehouseId, string message, CancellationToken cancellationToken = default);
    Task NotifyExpiringSoonAsync(Guid warehouseId, string message, CancellationToken cancellationToken = default);
}
