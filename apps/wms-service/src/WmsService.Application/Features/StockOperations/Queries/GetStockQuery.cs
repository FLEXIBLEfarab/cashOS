using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.StockOperations.Queries;

public sealed record GetStockQuery(Guid? WarehouseId, Guid? ProductId) : IRequest<IReadOnlyList<StockDto>>;

public sealed record StockDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public Guid WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal ReservedQuantity { get; init; }
    public decimal AvailableQuantity { get; init; }
}

public sealed class GetStockQueryHandler : IRequestHandler<GetStockQuery, IReadOnlyList<StockDto>>
{
    private readonly IStockRepository _stockRepository;

    public GetStockQueryHandler(IStockRepository stockRepository)
    {
        _stockRepository = stockRepository;
    }

    public async Task<IReadOnlyList<StockDto>> Handle(GetStockQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Stock> stocks = request.WarehouseId.HasValue
            ? await _stockRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken)
            : await _stockRepository.GetAllAsync(cancellationToken);

        if (request.ProductId.HasValue)
        {
            stocks = stocks.Where(s => s.ProductId == request.ProductId.Value);
        }

        return stocks.Select(s => new StockDto
        {
            Id = s.Id,
            ProductId = s.ProductId,
            ProductName = s.Product?.Name ?? string.Empty,
            WarehouseId = s.WarehouseId,
            WarehouseName = s.Warehouse?.Name ?? string.Empty,
            Quantity = s.Quantity,
            ReservedQuantity = s.ReservedQuantity,
            AvailableQuantity = s.AvailableQuantity
        }).ToList();
    }
}
