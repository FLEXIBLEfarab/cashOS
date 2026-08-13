using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.Analytics.Queries;

public sealed record GetSalesQuery(
    DateTime From,
    DateTime To,
    Guid? WarehouseId = null,
    Guid? ProductId = null) : IRequest<IReadOnlyList<SalesDto>>;

public sealed class GetSalesQueryHandler : IRequestHandler<GetSalesQuery, IReadOnlyList<SalesDto>>
{
    private readonly IRepository<StockMovement> _movementRepo;

    public GetSalesQueryHandler(IRepository<StockMovement> movementRepo)
    {
        _movementRepo = movementRepo;
    }

    public async Task<IReadOnlyList<SalesDto>> Handle(GetSalesQuery request, CancellationToken cancellationToken)
    {
        var movements = await _movementRepo.FindAsync(
            m => m.Type == MovementType.WriteOff && m.CreatedAt >= request.From && m.CreatedAt <= request.To,
            cancellationToken);

        if (request.WarehouseId.HasValue)
            movements = movements.Where(m => m.Stock.WarehouseId == request.WarehouseId.Value).ToList();

        if (request.ProductId.HasValue)
            movements = movements.Where(m => m.Stock.ProductId == request.ProductId.Value).ToList();

        var result = movements
            .GroupBy(m => m.Stock.ProductId)
            .Select(g => new SalesDto(
                g.Key,
                g.First().Stock.Product.Name,
                g.Sum(m => m.Quantity),
                g.Sum(m => m.Quantity * 1000m),
                request.From,
                request.To))
            .ToList();

        return result;
    }
}
