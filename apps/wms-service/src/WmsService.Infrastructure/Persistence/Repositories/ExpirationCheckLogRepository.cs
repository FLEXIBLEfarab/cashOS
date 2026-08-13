using Microsoft.EntityFrameworkCore;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Repositories;

public sealed class ExpirationCheckLogRepository : Repository<ExpirationCheckLog>, IExpirationCheckLogRepository
{
    public ExpirationCheckLogRepository(WmsDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<ExpirationCheckLog> Items, int TotalCount)> GetFilteredAsync(
        Guid? warehouseId,
        DateTime? dateFrom,
        DateTime? dateTo,
        bool? isExpired,
        bool? isExpiringSoon,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(l => l.Product)
            .Include(l => l.Warehouse)
            .Include(l => l.Batch)
            .AsNoTracking()
            .AsQueryable();

        if (warehouseId.HasValue)
            query = query.Where(l => l.WarehouseId == warehouseId.Value);

        if (dateFrom.HasValue)
            query = query.Where(l => l.CheckDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(l => l.CheckDate <= dateTo.Value);

        if (isExpired.HasValue)
            query = query.Where(l => l.IsExpired == isExpired.Value);

        if (isExpiringSoon.HasValue)
            query = query.Where(l => l.IsExpiringSoon == isExpiringSoon.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(l => l.CheckDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
