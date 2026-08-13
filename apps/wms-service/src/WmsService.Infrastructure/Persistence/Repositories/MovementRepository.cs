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
            .Include(m => m.Stock).ThenInclude(s => s.Product)
            .Include(m => m.Batch)
            .Where(m => (m.SourceWarehouseId == warehouseId || m.TargetWarehouseId == warehouseId || m.Stock.WarehouseId == warehouseId)
                        && m.CreatedAt >= from && m.CreatedAt <= to)
            .OrderByDescending(m => m.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    // NOTE: StockMovement сейчас не хранит DocumentId/DocumentType (только
    // ReceivingDocument/WriteOff их имеют). Метод пока нигде не вызывается —
    // возвращает пустой список до тех пор, пока у StockMovement не появится
    // привязка к документу-источнику.
    public Task<IReadOnlyList<StockMovement>> GetByDocumentAsync(string documentId, string documentType, CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<StockMovement>>(Array.Empty<StockMovement>());
    }

    public async Task<IReadOnlyList<StockMovement>> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(m => m.Stock)
            .Where(m => m.Stock.ProductId == productId && m.Stock.WarehouseId == warehouseId)
            .OrderByDescending(m => m.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
