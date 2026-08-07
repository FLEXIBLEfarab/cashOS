using MediatR;
using Microsoft.EntityFrameworkCore;
using WmsService.Application.DTOs;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Queries;

namespace WmsService.Application.Handlers;

public sealed class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, IReadOnlyList<StockMovementDto>>
{
    private readonly IWmsDbContext _context;

    public GetStockMovementsQueryHandler(IWmsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<StockMovementDto>> Handle(GetStockMovementsQuery query, CancellationToken cancellationToken)
    {
        var movements = await _context.StockMovements
            .AsNoTracking()
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => m.WarehouseId == query.WarehouseId && m.PerformedAt >= query.From && m.PerformedAt <= query.To)
            .OrderByDescending(m => m.PerformedAt)
            .Select(m => new StockMovementDto
            {
                Id = m.Id,
                ProductId = m.ProductId,
                ProductName = m.Product.Name,
                WarehouseId = m.WarehouseId,
                WarehouseName = m.Warehouse.Name,
                MovementType = m.MovementType.ToString(),
                Quantity = m.Quantity,
                DocumentId = m.DocumentId,
                DocumentType = m.DocumentType,
                Reason = m.Reason,
                PerformedBy = m.PerformedBy,
                PerformedAt = m.PerformedAt
            })
            .ToListAsync(cancellationToken);

        return movements;
    }
}
