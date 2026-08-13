using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.Pricing.Queries;

public sealed record SeasonalPriceListDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public Guid? WarehouseId { get; init; }
    public string Name { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal Price { get; init; }
    public bool IsActive { get; init; }
}

public sealed record GetSeasonalPriceListsQuery(Guid? ProductId, bool ActiveOnly = false) : IRequest<IReadOnlyList<SeasonalPriceListDto>>;

public sealed class GetSeasonalPriceListsQueryHandler : IRequestHandler<GetSeasonalPriceListsQuery, IReadOnlyList<SeasonalPriceListDto>>
{
    private readonly IRepository<SeasonalPriceList> _priceLists;

    public GetSeasonalPriceListsQueryHandler(IRepository<SeasonalPriceList> priceLists)
    {
        _priceLists = priceLists;
    }

    public async Task<IReadOnlyList<SeasonalPriceListDto>> Handle(GetSeasonalPriceListsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var all = await _priceLists.FindAsync(p =>
            (!request.ProductId.HasValue || p.ProductId == request.ProductId.Value)
            && (!request.ActiveOnly || (p.IsActive && p.StartDate <= now && p.EndDate >= now)),
            cancellationToken);

        return all.Select(p => new SeasonalPriceListDto
        {
            Id = p.Id,
            ProductId = p.ProductId,
            ProductName = p.Product?.Name ?? string.Empty,
            WarehouseId = p.WarehouseId,
            Name = p.Name,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Price = p.Price,
            IsActive = p.IsActive
        }).OrderByDescending(p => p.StartDate).ToList();
    }
}

/// <summary>Текущая активная сезонная цена на товар (если есть) — null, если действует обычная цена.</summary>
public sealed record GetActiveSeasonalPriceQuery(Guid ProductId, Guid? WarehouseId) : IRequest<decimal?>;

public sealed class GetActiveSeasonalPriceQueryHandler : IRequestHandler<GetActiveSeasonalPriceQuery, decimal?>
{
    private readonly IRepository<SeasonalPriceList> _priceLists;

    public GetActiveSeasonalPriceQueryHandler(IRepository<SeasonalPriceList> priceLists)
    {
        _priceLists = priceLists;
    }

    public async Task<decimal?> Handle(GetActiveSeasonalPriceQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var matches = await _priceLists.FindAsync(p =>
            p.ProductId == request.ProductId
            && p.IsActive
            && p.StartDate <= now && p.EndDate >= now
            && (p.WarehouseId == null || p.WarehouseId == request.WarehouseId),
            cancellationToken);

        // Приоритет складской цене над общей (WarehouseId == null), если есть обе.
        return matches
            .OrderByDescending(p => p.WarehouseId.HasValue)
            .Select(p => (decimal?)p.Price)
            .FirstOrDefault();
    }
}
