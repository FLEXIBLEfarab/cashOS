using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Queries;

public sealed record GetExpiringProductsQuery(Guid WarehouseId, int Days) : IRequest<IReadOnlyList<ExpiringProductDto>>;

public sealed record GetExpiredProductsQuery(Guid WarehouseId) : IRequest<IReadOnlyList<ExpiringProductDto>>;
