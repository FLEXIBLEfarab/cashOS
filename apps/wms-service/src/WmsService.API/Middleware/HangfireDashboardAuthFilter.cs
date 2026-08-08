using Hangfire.Dashboard;

namespace WmsService.API.Middleware;

public sealed class HangfireDashboardAuthFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        return true;
    }
}
