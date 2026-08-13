using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Queries;

public sealed record GetStockMovementsQuery(Guid WarehouseId, DateTime From, DateTime To) : IRequest<IReadOnlyList<StockMovementDto>>;
