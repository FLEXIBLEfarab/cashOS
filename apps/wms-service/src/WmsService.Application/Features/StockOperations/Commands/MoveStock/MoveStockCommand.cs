using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.StockOperations.Commands.MoveStock;

public sealed record MoveStockCommand : IRequest<MoveStockResponse>
{
    public Guid ProductId { get; init; }
    public Guid SourceWarehouseId { get; init; }
    public Guid DestinationWarehouseId { get; init; }
    public Guid? BatchId { get; init; }
    public decimal Quantity { get; init; }
    public string DocumentNumber { get; init; } = string.Empty;
    public string PerformedBy { get; init; } = string.Empty;
}

public sealed record MoveStockResponse
{
    public Guid SourceMovementId { get; init; }
    public Guid DestinationMovementId { get; init; }
}

public sealed class MoveStockCommandHandler : IRequestHandler<MoveStockCommand, MoveStockResponse>
{
    private readonly IStockRepository _stockRepository;
    private readonly IRepository<StockMovement> _movements;
    private readonly IUnitOfWork _unitOfWork;

    public MoveStockCommandHandler(
        IStockRepository stockRepository,
        IRepository<StockMovement> movements,
        IUnitOfWork unitOfWork)
    {
        _stockRepository = stockRepository;
        _movements = movements;
        _unitOfWork = unitOfWork;
    }

    public async Task<MoveStockResponse> Handle(MoveStockCommand request, CancellationToken cancellationToken)
    {
        var sourceStock = await _stockRepository.GetByProductAndWarehouseAsync(request.ProductId, request.SourceWarehouseId, cancellationToken)
            ?? throw new InvalidOperationException("Source stock not found");
        sourceStock.Decrease(request.Quantity);

        var destinationStock = await _stockRepository.GetByProductAndWarehouseAsync(request.ProductId, request.DestinationWarehouseId, cancellationToken);
        if (destinationStock is null)
        {
            destinationStock = new Stock(request.ProductId, request.DestinationWarehouseId, request.Quantity);
            await _stockRepository.AddAsync(destinationStock, cancellationToken);
        }
        else
        {
            destinationStock.Increase(request.Quantity);
        }

        var outMovement = new StockMovement
        {
            StockId = sourceStock.Id,
            BatchId = request.BatchId,
            Type = MovementType.MoveOut,
            Quantity = request.Quantity,
            Reason = request.DocumentNumber,
            SourceWarehouseId = request.SourceWarehouseId,
            TargetWarehouseId = request.DestinationWarehouseId
        };
        await _movements.AddAsync(outMovement, cancellationToken);

        var inMovement = new StockMovement
        {
            StockId = destinationStock.Id,
            BatchId = request.BatchId,
            Type = MovementType.MoveIn,
            Quantity = request.Quantity,
            Reason = request.DocumentNumber,
            SourceWarehouseId = request.SourceWarehouseId,
            TargetWarehouseId = request.DestinationWarehouseId
        };
        await _movements.AddAsync(inMovement, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MoveStockResponse
        {
            SourceMovementId = outMovement.Id,
            DestinationMovementId = inMovement.Id
        };
    }
}
