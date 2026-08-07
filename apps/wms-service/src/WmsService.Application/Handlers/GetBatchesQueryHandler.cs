using MediatR;
using Microsoft.EntityFrameworkCore;
using WmsService.Application.DTOs;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Queries;

namespace WmsService.Application.Handlers;

public sealed class GetBatchesQueryHandler : IRequestHandler<GetBatchesQuery, IReadOnlyList<BatchDto>>
{
    private readonly IWmsDbContext _context;

    public GetBatchesQueryHandler(IWmsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<BatchDto>> Handle(GetBatchesQuery query, CancellationToken cancellationToken)
    {
        var queryable = _context.Batches
            .AsNoTracking()
            .Include(b => b.Product)
            .Include(b => b.Warehouse)
            .Where(b => b.WarehouseId == query.WarehouseId && b.CurrentQuantity > 0);

        if (query.ProductId.HasValue)
            queryable = queryable.Where(b => b.ProductId == query.ProductId.Value);

        var batches = await queryable
            .OrderBy(b => b.ExpirationDate)
            .Select(b => new BatchDto
            {
                Id = b.Id,
                ProductId = b.ProductId,
                ProductName = b.Product.Name,
                WarehouseId = b.WarehouseId,
                WarehouseName = b.Warehouse.Name,
                BatchNumber = b.BatchNumber,
                ProductionDate = b.ProductionDate,
                ExpirationDate = b.ExpirationDate,
                InitialQuantity = b.InitialQuantity,
                CurrentQuantity = b.CurrentQuantity,
                IsBlocked = b.IsBlocked,
                BlockedReason = b.BlockedReason,
                ReceivedAt = b.ReceivedAt
            })
            .ToListAsync(cancellationToken);

        return batches;
    }
}
