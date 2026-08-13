using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Commands;

public sealed record MoveStockCommand(MoveStockRequest Request) : IRequest<MoveStockResult>;

public sealed record MoveStockResult
{
    public Guid SourceMovementId { get; init; }
    public Guid DestinationMovementId { get; init; }
}
