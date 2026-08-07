using Microsoft.EntityFrameworkCore;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Repositories;

public sealed class MovementRepository : Repository<StockMovement>, IMovementRepository
{
    public MovementRepository(WmsDbContext context) : base(context) { }

    public async Task<IReadOnlyList<StockMovement>> GetByWarehouseAsync(Guid warehouseId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(m => m.Product)
            .Include(m => m.Batch)
            .Where(m => m.WarehouseId == warehouseId && m.PerformedAt >= from && m.PerformedAt <= to)
            .OrderByDescending(m => m.PerformedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByDocumentAsync(string documentId, string documentType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(m => m.Product)
            .Where(m => m.DocumentId == documentId && m.DocumentType == documentType)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.ProductId == productId && m.WarehouseId == warehouseId)
            .OrderByDescending(m => m.PerformedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
