using MediatR;
using WmsService.Application.DTOs;

namespace WmsService.Application.Commands;

public sealed record WriteOffStockCommand(WriteOffStockRequest Request) : IRequest<WriteOffStockResult>;

public sealed record WriteOffStockResult
{
    public Guid WriteOffId { get; init; }
}
