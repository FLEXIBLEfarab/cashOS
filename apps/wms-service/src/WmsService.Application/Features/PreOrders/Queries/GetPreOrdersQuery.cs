using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.PreOrders.Queries;

public sealed record PreOrderDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public Guid WarehouseId { get; init; }
    public string WarehouseName { get; init; } = string.Empty;
    public string CustomerReference { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public DateTime RequestedDate { get; init; }
    public PreOrderStatus Status { get; init; }
    public string? Notes { get; init; }
}

public sealed record GetPreOrdersQuery(Guid? WarehouseId, PreOrderStatus? Status) : IRequest<IReadOnlyList<PreOrderDto>>;

public sealed class GetPreOrdersQueryHandler : IRequestHandler<GetPreOrdersQuery, IReadOnlyList<PreOrderDto>>
{
    private readonly IRepository<PreOrder> _preOrders;

    public GetPreOrdersQueryHandler(IRepository<PreOrder> preOrders)
    {
        _preOrders = preOrders;
    }

    public async Task<IReadOnlyList<PreOrderDto>> Handle(GetPreOrdersQuery request, CancellationToken cancellationToken)
    {
        var results = await _preOrders.FindAsync(p =>
            (!request.WarehouseId.HasValue || p.WarehouseId == request.WarehouseId.Value)
            && (!request.Status.HasValue || p.Status == request.Status.Value),
            cancellationToken);

        return results.Select(p => new PreOrderDto
        {
            Id = p.Id,
            ProductId = p.ProductId,
            ProductName = p.Product?.Name ?? string.Empty,
            WarehouseId = p.WarehouseId,
            WarehouseName = p.Warehouse?.Name ?? string.Empty,
            CustomerReference = p.CustomerReference,
            Quantity = p.Quantity,
            RequestedDate = p.RequestedDate,
            Status = p.Status,
            Notes = p.Notes
        }).OrderBy(p => p.RequestedDate).ToList();
    }
}
