using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Queries;

public sealed record GetStockByWarehouseQuery(Guid WarehouseId) : IRequest<IReadOnlyList<StockDto>>;
