namespace WmsService.Application.Common.Interfaces;

public interface IWmsNotificationService
{
    Task NotifyNewExpiredProductAsync(Guid productId, string productName, Guid warehouseId, string warehouseName, string batchNumber, CancellationToken cancellationToken = default);
    Task NotifyExpiringSoonAsync(Guid productId, string productName, Guid warehouseId, string warehouseName, string batchNumber, int daysLeft, CancellationToken cancellationToken = default);
    Task NotifyWarehouseUpdatedAsync(Guid warehouseId, string warehouseName, CancellationToken cancellationToken = default);
    Task NotifyStockChangedAsync(Guid productId, Guid warehouseId, decimal newQuantity, CancellationToken cancellationToken = default);
}
