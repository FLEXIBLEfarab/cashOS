using Microsoft.AspNetCore.SignalR;
using WmsService.Infrastructure.SignalR;

namespace WmsService.Infrastructure.SignalR.Hubs;

public sealed class WmsHub : Hub<IWmsHubClient>
{
    public async Task JoinWarehouseGroup(string warehouseId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, warehouseId);
    }

    public async Task LeaveWarehouseGroup(string warehouseId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, warehouseId);
    }
}
