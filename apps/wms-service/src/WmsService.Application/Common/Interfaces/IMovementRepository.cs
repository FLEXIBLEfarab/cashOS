using WmsService.Domain.Entities;

namespace WmsService.Application.Common.Interfaces;

public interface IMovementRepository : IRepository<StockMovement>
{
    Task<IReadOnlyList<StockMovement>> GetByWarehouseAsync(Guid warehouseId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockMovement>> GetByDocumentAsync(string documentId, string documentType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockMovement>> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default);
}
