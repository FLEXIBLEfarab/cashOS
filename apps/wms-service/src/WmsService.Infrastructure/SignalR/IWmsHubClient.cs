namespace WmsService.Infrastructure.SignalR;

/// <summary>
/// Типизированный клиент SignalR-хаба WmsHub. Методы соответствуют событиям,
/// которые фронтенд подписывает через connection.on("<MethodName>", ...).
/// </summary>
public interface IWmsHubClient
{
    Task WarehouseUpdated(Guid warehouseId);
    Task StockChanged(Guid productId, Guid warehouseId, decimal newQuantity);
    Task NewExpiredProduct(string message);
    Task ExpiringSoon(string message);
}
