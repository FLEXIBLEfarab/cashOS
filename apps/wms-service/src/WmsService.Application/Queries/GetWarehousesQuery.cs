using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Queries;

public sealed record GetWarehousesQuery : IRequest<IReadOnlyList<WarehouseDto>>;

public sealed record GetWarehouseByIdQuery(Guid Id) : IRequest<WarehouseDto?>;
