using WmsService.Domain.Entities;

namespace WmsService.Application.Common.Interfaces;

public interface IExpirationCheckLogRepository
{
    Task<(IReadOnlyList<ExpirationCheckLog> Items, int TotalCount)> GetFilteredAsync(
        Guid? warehouseId,
        DateTime? dateFrom,
        DateTime? dateTo,
        bool? isExpired,
        bool? isExpiringSoon,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
