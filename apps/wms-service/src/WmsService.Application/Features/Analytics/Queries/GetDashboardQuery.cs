using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.Analytics.Queries;

public sealed record GetDashboardQuery(Guid? WarehouseId = null) : IRequest<DashboardDto>;

public sealed class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IRepository<Warehouse> _warehouseRepo;
    private readonly IRepository<Product> _productRepo;
    private readonly IRepository<Stock> _stockRepo;
    private readonly IRepository<Batch> _batchRepo;

    public GetDashboardQueryHandler(
        IRepository<Warehouse> warehouseRepo,
        IRepository<Product> productRepo,
        IRepository<Stock> stockRepo,
        IRepository<Batch> batchRepo)
    {
        _warehouseRepo = warehouseRepo;
        _productRepo = productRepo;
        _stockRepo = stockRepo;
        _batchRepo = batchRepo;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow.Date;
        var threshold = now.AddDays(7);

        var warehouses = await _warehouseRepo.GetAllAsync(cancellationToken);
        var products = await _productRepo.GetAllAsync(cancellationToken);
        var stocks = await _stockRepo.GetAllAsync(cancellationToken);
        var batches = await _batchRepo.GetAllAsync(cancellationToken);

        var query = batches.AsQueryable();
        if (request.WarehouseId.HasValue)
            query = query.Where(b => b.WarehouseId == request.WarehouseId.Value);

        var expired = query.Count(b => b.ExpirationDate < now && b.CurrentQuantity > 0);
        var expiringSoon = query.Count(b => b.ExpirationDate >= now && b.ExpirationDate <= threshold && b.CurrentQuantity > 0 && !b.IsBlocked);
        var lowStock = stocks.Count(s => s.Quantity <= (s.Product.MinStockLevel ?? 0));
        var totalValue = stocks.Sum(s => s.Quantity * 1000m);

        return new DashboardDto(
            warehouses.Count,
            products.Count,
            totalValue,
            expired,
            expiringSoon,
            lowStock);
    }
}
