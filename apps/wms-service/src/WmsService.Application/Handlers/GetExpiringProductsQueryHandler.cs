using MediatR;
using Microsoft.EntityFrameworkCore;
using WmsService.Application.DTOs;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Queries;

namespace WmsService.Application.Handlers;

public sealed class GetExpiringProductsQueryHandler :
    IRequestHandler<GetExpiringProductsQuery, IReadOnlyList<ExpiringProductDto>>,
    IRequestHandler<GetExpiredProductsQuery, IReadOnlyList<ExpiringProductDto>>
{
    private readonly IWmsDbContext _context;

    public GetExpiringProductsQueryHandler(IWmsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ExpiringProductDto>> Handle(GetExpiringProductsQuery query, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow.Date;
        var threshold = now.AddDays(query.Days);

        var products = await _context.Batches
            .AsNoTracking()
            .Include(b => b.Product)
            .Include(b => b.Warehouse)
            .Where(b => b.WarehouseId == query.WarehouseId
                && b.ExpirationDate >= now
                && b.ExpirationDate <= threshold
                && b.CurrentQuantity > 0
                && !b.IsBlocked)
            .Select(b => new ExpiringProductDto
            {
                BatchId = b.Id,
                ProductId = b.ProductId,
                ProductName = b.Product.Name,
                BatchNumber = b.BatchNumber,
                ExpirationDate = b.ExpirationDate,
                DaysUntilExpiration = b.ExpirationDate.HasValue ? (b.ExpirationDate.Value.Date - now).Days : 0,
                CurrentQuantity = b.CurrentQuantity,
                WarehouseId = b.WarehouseId,
                WarehouseName = b.Warehouse.Name
            })
            .ToListAsync(cancellationToken);

        return products;
    }

    public async Task<IReadOnlyList<ExpiringProductDto>> Handle(GetExpiredProductsQuery query, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow.Date;

        var products = await _context.Batches
            .AsNoTracking()
            .Include(b => b.Product)
            .Include(b => b.Warehouse)
            .Where(b => b.WarehouseId == query.WarehouseId
                && b.ExpirationDate < now
                && b.CurrentQuantity > 0)
            .Select(b => new ExpiringProductDto
            {
                BatchId = b.Id,
                ProductId = b.ProductId,
                ProductName = b.Product.Name,
                BatchNumber = b.BatchNumber,
                ExpirationDate = b.ExpirationDate,
                DaysUntilExpiration = b.ExpirationDate.HasValue ? (b.ExpirationDate.Value.Date - now).Days : 0,
                CurrentQuantity = b.CurrentQuantity,
                WarehouseId = b.WarehouseId,
                WarehouseName = b.Warehouse.Name
            })
            .ToListAsync(cancellationToken);

        return products;
    }
}
