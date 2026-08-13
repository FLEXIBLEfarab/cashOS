using WmsService.Domain.Entities;

namespace WmsService.Application.Common.Interfaces;

public interface IStockRepository : IRepository<Stock>
{
    Task<Stock?> GetByProductAndWarehouseAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Stock>> GetByWarehouseAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Stock>> GetLowStockAsync(Guid warehouseId, decimal threshold, CancellationToken cancellationToken = default);
}
