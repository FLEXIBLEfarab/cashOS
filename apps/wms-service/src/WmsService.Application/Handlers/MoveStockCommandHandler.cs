using MediatR;
using Microsoft.Extensions.Logging;
using WmsService.Application.Commands;
using WmsService.Application.Common.Exceptions;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;
using WmsService.Domain.Enums;

namespace WmsService.Application.Handlers;

public sealed class MoveStockCommandHandler : IRequestHandler<MoveStockCommand, MoveStockResult>
{
    private readonly IWmsDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStockRepository _stockRepository;
    private readonly IRealTimeNotifier _realTimeNotifier;
    private readonly ILogger<MoveStockCommandHandler> _logger;

    public MoveStockCommandHandler(
        IWmsDbContext context,
        IUnitOfWork unitOfWork,
        IStockRepository stockRepository,
        IRealTimeNotifier realTimeNotifier,
        ILogger<MoveStockCommandHandler> logger)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _stockRepository = stockRepository;
        _realTimeNotifier = realTimeNotifier;
        _logger = logger;
    }

    public async Task<MoveStockResult> Handle(MoveStockCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        if (request.SourceWarehouseId == request.DestinationWarehouseId)
            throw new WmsException("Source and destination warehouses must be different");

        var sourceWarehouse = await _context.Warehouses.FindAsync(new object[] { request.SourceWarehouseId }, cancellationToken)
            ?? throw new NotFoundException("Warehouse", request.SourceWarehouseId);

        var destWarehouse = await _context.Warehouses.FindAsync(new object[] { request.DestinationWarehouseId }, cancellationToken)
            ?? throw new NotFoundException("Warehouse", request.DestinationWarehouseId);

        var sourceStock = await _stockRepository.GetByProductAndWarehouseAsync(request.ProductId, request.SourceWarehouseId, cancellationToken)
            ?? throw new NotFoundException("Stock", $"Product {request.ProductId} in Warehouse {request.SourceWarehouseId}");

        if (sourceStock.AvailableQuantity < request.Quantity)
            throw new WmsException($"Insufficient stock. Available: {sourceStock.AvailableQuantity}, Requested: {request.Quantity}");

        if (request.BatchId.HasValue)
        {
            var batch = await _context.Batches.FindAsync(new object[] { request.BatchId.Value }, cancellationToken)
                ?? throw new NotFoundException("Batch", request.BatchId.Value);

            if (batch.WarehouseId != request.SourceWarehouseId)
                throw new WmsException("Batch does not belong to the source warehouse");

            if (batch.CurrentQuantity < request.Quantity)
                throw new WmsException($"Insufficient quantity in batch. Available: {batch.CurrentQuantity}, Requested: {request.Quantity}");

            batch.ReduceQuantity(request.Quantity);

            var newBatch = new Batch(
                request.ProductId,
                request.DestinationWarehouseId,
                batch.BatchNumber,
                request.Quantity,
                batch.ExpirationDate,
                batch.ProductionDate,
                batch.SupplierId);

            await _context.Batches.AddAsync(newBatch, cancellationToken);
        }

        sourceStock.Decrease(request.Quantity);
        await _stockRepository.UpdateAsync(sourceStock, cancellationToken);

        var destStock = await _stockRepository.GetByProductAndWarehouseAsync(request.ProductId, request.DestinationWarehouseId, cancellationToken);
        if (destStock is null)
        {
            destStock = new Stock(request.ProductId, request.DestinationWarehouseId, request.Quantity);
            await _stockRepository.AddAsync(destStock, cancellationToken);
        }
        else
        {
            destStock.Increase(request.Quantity);
            await _stockRepository.UpdateAsync(destStock, cancellationToken);
        }

        var sourceMovement = new StockMovement(
            request.ProductId,
            request.SourceWarehouseId,
            MovementType.MoveOut,
            request.Quantity,
            request.DocumentNumber,
            "MoveDocument",
            request.PerformedBy,
            request.BatchId,
            sourceWarehouseId: request.SourceWarehouseId,
            destinationWarehouseId: request.DestinationWarehouseId);

        var destMovement = new StockMovement(
            request.ProductId,
            request.DestinationWarehouseId,
            MovementType.MoveIn,
            request.Quantity,
            request.DocumentNumber,
            "MoveDocument",
            request.PerformedBy,
            request.BatchId,
            sourceWarehouseId: request.SourceWarehouseId,
            destinationWarehouseId: request.DestinationWarehouseId);

        await _context.StockMovements.AddAsync(sourceMovement, cancellationToken);
        await _context.StockMovements.AddAsync(destMovement, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _realTimeNotifier.NotifyWarehouseUpdatedAsync(request.SourceWarehouseId, cancellationToken);
        await _realTimeNotifier.NotifyWarehouseUpdatedAsync(request.DestinationWarehouseId, cancellationToken);

        _logger.LogInformation(
            "Moved {Quantity} of product {ProductId} from warehouse {Source} to {Destination}",
            request.Quantity, request.ProductId, request.SourceWarehouseId, request.DestinationWarehouseId);

        return new MoveStockResult
        {
            SourceMovementId = sourceMovement.Id,
            DestinationMovementId = destMovement.Id
        };
    }
}
