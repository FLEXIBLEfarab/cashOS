using MediatR;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Application.Features.StockOperations.Queries;

public sealed record GetStockMovementsQuery(Guid? StockId, Guid? WarehouseId) : IRequest<IReadOnlyList<StockMovement>>;

/// <summary>
/// DTO для ответа API. Называется так же, как доменная сущность
/// (WmsService.Domain.Entities.StockMovement) — намеренно, чтобы не менять
/// уже существующий контракт StockController. Внутри этого файла доменная
/// сущность используется только через полное имя, чтобы не было конфликта.
/// </summary>
public sealed record StockMovement
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public Guid WarehouseId { get; init; }
    public string MovementType { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string? Reason { get; init; }
    public DateTime PerformedAt { get; init; }
}

public sealed class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, IReadOnlyList<StockMovement>>
{
    private readonly IMovementRepository _movementRepository;

    public GetStockMovementsQueryHandler(IMovementRepository movementRepository)
    {
        _movementRepository = movementRepository;
    }

    public async Task<IReadOnlyList<StockMovement>> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<WmsService.Domain.Entities.StockMovement> movements = request.WarehouseId.HasValue
            ? await _movementRepository.GetByWarehouseAsync(request.WarehouseId.Value, DateTime.MinValue, DateTime.MaxValue, cancellationToken)
            : await _movementRepository.GetAllAsync(cancellationToken);

        if (request.StockId.HasValue)
        {
            movements = movements.Where(m => m.StockId == request.StockId.Value);
        }

        return movements.Select(m => new StockMovement
        {
            Id = m.Id,
            ProductId = m.Stock?.ProductId ?? Guid.Empty,
            ProductName = m.Stock?.Product?.Name ?? string.Empty,
            WarehouseId = m.Stock?.WarehouseId ?? m.SourceWarehouseId ?? m.TargetWarehouseId ?? Guid.Empty,
            MovementType = m.Type.ToString(),
            Quantity = m.Quantity,
            Reason = m.Reason,
            PerformedAt = m.CreatedAt
        }).ToList();
    }
}
