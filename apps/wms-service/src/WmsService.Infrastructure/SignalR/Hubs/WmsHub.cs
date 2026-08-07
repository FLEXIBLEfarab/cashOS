using Microsoft.AspNetCore.SignalR;

namespace WmsService.Infrastructure.SignalR.Hubs;

public interface IWmsHubClient
{
    Task NewExpiredProduct(string message);
    Task ExpiringSoon(string message);
    Task WarehouseUpdated(Guid warehouseId);
    Task StockChanged(Guid productId, Guid warehouseId, decimal newQuantity);
    Task InventoryCompleted(Guid inventoryId);
}

public sealed class WmsHub : Hub<IWmsHubClient>
{
    public async Task SubscribeToWarehouse(Guid warehouseId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, warehouseId.ToString());
    }

    public async Task UnsubscribeFromWarehouse(Guid warehouseId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, warehouseId.ToString());
    }
}
