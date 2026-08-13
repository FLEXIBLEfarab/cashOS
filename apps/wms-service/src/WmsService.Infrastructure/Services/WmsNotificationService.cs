using Microsoft.AspNetCore.SignalR;
using WmsService.Application.Common.Interfaces;
using WmsService.Infrastructure.SignalR.Hubs;

namespace WmsService.Infrastructure.Services;

public sealed class WmsNotificationService : IWmsNotificationService
{
    private readonly IHubContext<WmsHub> _hubContext;

    public WmsNotificationService(IHubContext<WmsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyNewExpiredProductAsync(
        Guid productId, string productName, Guid warehouseId, string warehouseName,
        string batchNumber, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(warehouseId.ToString()).SendAsync(
            "NewExpiredProduct",
            new { ProductId = productId, ProductName = productName, WarehouseId = warehouseId, WarehouseName = warehouseName, BatchNumber = batchNumber, DetectedAt = DateTime.UtcNow },
            cancellationToken);
    }

    public async Task NotifyExpiringSoonAsync(
        Guid productId, string productName, Guid warehouseId, string warehouseName,
        string batchNumber, int daysLeft, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(warehouseId.ToString()).SendAsync(
            "ExpiringSoon",
            new { ProductId = productId, ProductName = productName, WarehouseId = warehouseId, WarehouseName = warehouseName, BatchNumber = batchNumber, DaysLeft = daysLeft },
            cancellationToken);
    }

    public async Task NotifyWarehouseUpdatedAsync(
        Guid warehouseId, string warehouseName, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.All.SendAsync(
            "WarehouseUpdated",
            new { WarehouseId = warehouseId, WarehouseName = warehouseName, UpdatedAt = DateTime.UtcNow },
            cancellationToken);
    }

    public async Task NotifyStockChangedAsync(
        Guid productId, Guid warehouseId, decimal newQuantity, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(warehouseId.ToString()).SendAsync(
            "StockChanged",
            new { ProductId = productId, WarehouseId = warehouseId, NewQuantity = newQuantity, ChangedAt = DateTime.UtcNow },
            cancellationToken);
    }
}
