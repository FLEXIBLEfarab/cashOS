using Microsoft.AspNetCore.SignalR;
using WmsService.Application.Common.Interfaces;
using WmsService.Infrastructure.SignalR.Hubs;

namespace WmsService.Infrastructure.SignalR;

public sealed class RealTimeNotifier : IRealTimeNotifier
{
    private readonly IHubContext<WmsHub, IWmsHubClient> _hubContext;

    public RealTimeNotifier(IHubContext<WmsHub, IWmsHubClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyWarehouseUpdatedAsync(Guid warehouseId, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(warehouseId.ToString()).WarehouseUpdated(warehouseId);
    }

    public async Task NotifyStockChangedAsync(Guid productId, Guid warehouseId, decimal newQuantity, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(warehouseId.ToString()).StockChanged(productId, warehouseId, newQuantity);
    }

    public async Task NotifyNewExpiredProductAsync(Guid warehouseId, string message, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(warehouseId.ToString()).NewExpiredProduct(message);
    }

    public async Task NotifyExpiringSoonAsync(Guid warehouseId, string message, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(warehouseId.ToString()).ExpiringSoon(message);
    }
}
