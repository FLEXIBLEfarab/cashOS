using WmsService.Domain.Entities;

namespace WmsService.Application.Common.Interfaces;

public interface IBatchRepository : IRepository<Batch>
{
    Task<IReadOnlyList<Batch>> GetExpiredAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetExpiringSoonAsync(Guid warehouseId, int days, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetBlockedAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetAllExpiredAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Batch>> GetAllExpiringSoonAsync(int days, CancellationToken cancellationToken = default);
}
