using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.PreOrders.Commands;

public sealed record CreatePreOrderCommand : IRequest<Guid>
{
    public Guid ProductId { get; init; }
    public Guid WarehouseId { get; init; }
    public string CustomerReference { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public DateTime RequestedDate { get; init; }
    public string? Notes { get; init; }
}

public sealed class CreatePreOrderCommandHandler : IRequestHandler<CreatePreOrderCommand, Guid>
{
    private readonly IRepository<PreOrder> _preOrders;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePreOrderCommandHandler(IRepository<PreOrder> preOrders, IUnitOfWork unitOfWork)
    {
        _preOrders = preOrders;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreatePreOrderCommand request, CancellationToken cancellationToken)
    {
        var preOrder = new PreOrder
        {
            ProductId = request.ProductId,
            WarehouseId = request.WarehouseId,
            CustomerReference = request.CustomerReference,
            Quantity = request.Quantity,
            RequestedDate = request.RequestedDate,
            Notes = request.Notes,
            Status = PreOrderStatus.Pending
        };

        await _preOrders.AddAsync(preOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return preOrder.Id;
    }
}
