using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Queries;

public sealed record GetBatchesQuery(Guid WarehouseId, Guid? ProductId = null) : IRequest<IReadOnlyList<BatchDto>>;
