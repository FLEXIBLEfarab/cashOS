using Microsoft.EntityFrameworkCore;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Repositories;

public interface IStockRepository
{
    Task<Stock?> GetByProductAndWarehouseAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Stock>> GetByWarehouseAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Stock>> GetLowStockAsync(Guid warehouseId, decimal threshold, CancellationToken cancellationToken = default);
}

public sealed class StockRepository : Repository<Stock>, IStockRepository
{
    public StockRepository(WmsDbContext context) : base(context) { }

    public async Task<Stock?> GetByProductAndWarehouseAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId, cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetByWarehouseAsync(Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Product)
            .Where(s => s.WarehouseId == warehouseId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetLowStockAsync(Guid warehouseId, decimal threshold, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Product)
            .Where(s => s.WarehouseId == warehouseId && s.Quantity <= threshold)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
