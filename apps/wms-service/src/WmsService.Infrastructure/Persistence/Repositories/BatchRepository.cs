using Microsoft.EntityFrameworkCore;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Repositories;

public interface IBatchRepository
{
    Task<IReadOnlyList<Batch>> GetExpiredAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetExpiringSoonAsync(Guid warehouseId, int days, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetBlockedAsync(Guid warehouseId, CancellationToken cancellationToken = default);
}

public sealed class BatchRepository : Repository<Batch>, IBatchRepository
{
    public BatchRepository(WmsDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Batch>> GetExpiredAsync(Guid warehouseId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow.Date;
        return await _dbSet
            .Include(b => b.Product)
            .Where(b => b.WarehouseId == warehouseId && b.ExpirationDate < now && b.CurrentQuantity > 0)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Batch>> GetExpiringSoonAsync(Guid warehouseId, int days, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow.Date;
        var threshold = now.AddDays(days);
        return await _dbSet
            .Include(b => b.Product)
            .Where(b => b.WarehouseId == warehouseId && b.ExpirationDate >= now && b.ExpirationDate <= threshold && b.CurrentQuantity > 0 && !b.IsBlocked)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Batch>> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.ProductId == productId && b.WarehouseId == warehouseId && b.CurrentQuantity > 0)
            .OrderBy(b => b.ExpirationDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Batch>> GetBlockedAsync(Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Product)
            .Where(b => b.WarehouseId == warehouseId && b.IsBlocked && b.CurrentQuantity > 0)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
