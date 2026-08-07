using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Commands;

public sealed record ReceiveStockCommand(ReceiveStockRequest Request) : IRequest<ReceiveStockResult>;

public sealed record ReceiveStockResult
{
    public Guid ReceivingDocumentId { get; init; }
    public List<Guid> BatchIds { get; init; } = new();
}
