using MediatR;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Application.Features.Reports.Queries;

public sealed record GetExpiredBatchesReportQuery(Guid? WarehouseId) : IRequest<IReadOnlyList<ExpiredBatchRow>>;

public sealed record ExpiredBatchRow
{
    public Guid BatchId { get; init; }
    public string BatchNumber { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string WarehouseName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public bool IsBlocked { get; init; }
}

public sealed class GetExpiredBatchesReportQueryHandler : IRequestHandler<GetExpiredBatchesReportQuery, IReadOnlyList<ExpiredBatchRow>>
{
    private readonly IBatchRepository _batchRepository;

    public GetExpiredBatchesReportQueryHandler(IBatchRepository batchRepository)
    {
        _batchRepository = batchRepository;
    }

    public async Task<IReadOnlyList<ExpiredBatchRow>> Handle(GetExpiredBatchesReportQuery request, CancellationToken cancellationToken)
    {
        var batches = request.WarehouseId.HasValue
            ? await _batchRepository.GetExpiredAsync(request.WarehouseId.Value, cancellationToken)
            : await _batchRepository.GetAllExpiredAsync(cancellationToken);

        return batches.Select(b => new ExpiredBatchRow
        {
            BatchId = b.Id,
            BatchNumber = b.BatchNumber,
            ProductName = b.Product?.Name ?? string.Empty,
            WarehouseName = b.Warehouse?.Name ?? string.Empty,
            Quantity = b.CurrentQuantity,
            ExpirationDate = b.ExpirationDate,
            IsBlocked = b.IsBlocked
        }).ToList();
    }
}
