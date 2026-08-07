using MediatR;
using Microsoft.EntityFrameworkCore;
using WmsService.Application.DTOs;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Queries;

namespace WmsService.Application.Handlers;

public sealed class GetStockByWarehouseQueryHandler : IRequestHandler<GetStockByWarehouseQuery, IReadOnlyList<StockDto>>
{
    private readonly IWmsDbContext _context;

    public GetStockByWarehouseQueryHandler(IWmsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<StockDto>> Handle(GetStockByWarehouseQuery query, CancellationToken cancellationToken)
    {
        var stocks = await _context.Stocks
            .AsNoTracking()
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.WarehouseId == query.WarehouseId)
            .Select(s => new StockDto
            {
                Id = s.Id,
                ProductId = s.ProductId,
                ProductName = s.Product.Name,
                ProductBarcode = s.Product.Barcode,
                WarehouseId = s.WarehouseId,
                WarehouseName = s.Warehouse.Name,
                Quantity = s.Quantity,
                ReservedQuantity = s.ReservedQuantity,
                AvailableQuantity = s.AvailableQuantity
            })
            .ToListAsync(cancellationToken);

        return stocks;
    }
}
