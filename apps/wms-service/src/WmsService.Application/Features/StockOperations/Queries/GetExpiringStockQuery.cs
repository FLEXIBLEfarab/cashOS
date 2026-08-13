using MediatR;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Application.Features.StockOperations.Queries;

public sealed record GetExpiringStockQuery(Guid? WarehouseId, int Days = 7) : IRequest<IReadOnlyList<ExpiringStockRow>>;

public sealed record ExpiringStockRow
{
    public Guid BatchId { get; init; }
    public string BatchNumber { get; init; } = string.Empty;
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public Guid WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public DateTime? ExpirationDate { get; init; }
}

public sealed class GetExpiringStockQueryHandler : IRequestHandler<GetExpiringStockQuery, IReadOnlyList<ExpiringStockRow>>
{
    private readonly IBatchRepository _batchRepository;

    public GetExpiringStockQueryHandler(IBatchRepository batchRepository)
    {
        _batchRepository = batchRepository;
    }

    public async Task<IReadOnlyList<ExpiringStockRow>> Handle(GetExpiringStockQuery request, CancellationToken cancellationToken)
    {
        var batches = request.WarehouseId.HasValue
            ? await _batchRepository.GetExpiringSoonAsync(request.WarehouseId.Value, request.Days, cancellationToken)
            : await _batchRepository.GetAllExpiringSoonAsync(request.Days, cancellationToken);

        return batches.Select(b => new ExpiringStockRow
        {
            BatchId = b.Id,
            BatchNumber = b.BatchNumber,
            ProductId = b.ProductId,
            ProductName = b.Product?.Name ?? string.Empty,
            WarehouseId = b.WarehouseId,
            WarehouseName = b.Warehouse?.Name ?? string.Empty,
            Quantity = b.CurrentQuantity,
            ExpirationDate = b.ExpirationDate
        }).ToList();
    }
}
