using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.Analytics.Queries;

public sealed record GetNetworkQuery : IRequest<IReadOnlyList<NetworkDto>>;

public sealed class GetNetworkQueryHandler : IRequestHandler<GetNetworkQuery, IReadOnlyList<NetworkDto>>
{
    private readonly IRepository<Warehouse> _warehouseRepo;
    private readonly IRepository<Stock> _stockRepo;

    public GetNetworkQueryHandler(IRepository<Warehouse> warehouseRepo, IRepository<Stock> stockRepo)
    {
        _warehouseRepo = warehouseRepo;
        _stockRepo = stockRepo;
    }

    public async Task<IReadOnlyList<NetworkDto>> Handle(GetNetworkQuery request, CancellationToken cancellationToken)
    {
        var warehouses = await _warehouseRepo.GetAllAsync(cancellationToken);
        var stocks = await _stockRepo.GetAllAsync(cancellationToken);

        return warehouses.Select(w =>
        {
            var ws = stocks.Where(s => s.WarehouseId == w.Id).ToList();
            return new NetworkDto(
                w.Id,
                w.Name,
                ws.Sum(s => s.Quantity * 1000m),
                ws.Sum(s => s.Quantity * 1000m),
                ws.Select(s => s.ProductId).Distinct().Count());
        }).ToList();
    }
}
