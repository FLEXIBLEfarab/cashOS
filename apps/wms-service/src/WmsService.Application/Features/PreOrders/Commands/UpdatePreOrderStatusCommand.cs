using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.PreOrders.Commands;

public sealed record UpdatePreOrderStatusCommand(Guid PreOrderId, PreOrderStatus Status) : IRequest<Unit>;

public sealed class UpdatePreOrderStatusCommandHandler : IRequestHandler<UpdatePreOrderStatusCommand, Unit>
{
    private readonly IRepository<PreOrder> _preOrders;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePreOrderStatusCommandHandler(IRepository<PreOrder> preOrders, IUnitOfWork unitOfWork)
    {
        _preOrders = preOrders;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(UpdatePreOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var preOrder = await _preOrders.GetByIdAsync(request.PreOrderId, cancellationToken)
            ?? throw new InvalidOperationException($"PreOrder {request.PreOrderId} not found");

        preOrder.Status = request.Status;
        await _preOrders.UpdateAsync(preOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
