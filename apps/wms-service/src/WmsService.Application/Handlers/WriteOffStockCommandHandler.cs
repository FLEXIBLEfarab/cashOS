using MediatR;
using Microsoft.Extensions.Logging;
using WmsService.Application.Commands;
using WmsService.Application.Common.Exceptions;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;
using WmsService.Domain.Enums;
using WmsService.Domain.Events;

namespace WmsService.Application.Handlers;

public sealed class WriteOffStockCommandHandler : IRequestHandler<WriteOffStockCommand, WriteOffStockResult>
{
    private readonly IWmsDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStockRepository _stockRepository;
    private readonly IEventPublisher _eventPublisher;
    private readonly IRealTimeNotifier _realTimeNotifier;
    private readonly ILogger<WriteOffStockCommandHandler> _logger;

    public WriteOffStockCommandHandler(
        IWmsDbContext context,
        IUnitOfWork unitOfWork,
        IStockRepository stockRepository,
        IEventPublisher eventPublisher,
        IRealTimeNotifier realTimeNotifier,
        ILogger<WriteOffStockCommandHandler> logger)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _stockRepository = stockRepository;
        _eventPublisher = eventPublisher;
        _realTimeNotifier = realTimeNotifier;
        _logger = logger;
    }

    public async Task<WriteOffStockResult> Handle(WriteOffStockCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException("Warehouse", request.WarehouseId);

        if (!Enum.TryParse<WriteOffReason>(request.Reason, out var reason))
            throw new WmsException($"Invalid write-off reason: {request.Reason}");

        var writeOff = new WriteOff(request.DocumentNumber, request.WarehouseId, reason, request.CreatedBy);

        foreach (var item in request.Items)
        {
            var batch = await _context.Batches.FindAsync(new object[] { item.BatchId }, cancellationToken)
                ?? throw new NotFoundException("Batch", item.BatchId);

            if (batch.WarehouseId != request.WarehouseId)
                throw new WmsException("Batch does not belong to the specified warehouse");

            if (batch.CurrentQuantity < item.Quantity)
                throw new WmsException($"Insufficient quantity in batch {item.BatchId}. Available: {batch.CurrentQuantity}, Requested: {item.Quantity}");

            var writeOffItem = new WriteOffItem(writeOff.Id, item.ProductId, item.BatchId, item.Quantity, item.Reason);
            writeOff.AddItem(writeOffItem);

            batch.ReduceQuantity(item.Quantity);

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(item.ProductId, request.WarehouseId, cancellationToken)
                ?? throw new NotFoundException("Stock", $"Product {item.ProductId} in Warehouse {request.WarehouseId}");

            stock.Decrease(item.Quantity);
            await _stockRepository.UpdateAsync(stock, cancellationToken);

            var movement = new StockMovement(
                item.ProductId,
                request.WarehouseId,
                MovementType.WriteOff,
                item.Quantity,
                writeOff.Id.ToString(),
                "WriteOff",
                request.CreatedBy,
                item.BatchId,
                reason: item.Reason);

            await _context.StockMovements.AddAsync(movement, cancellationToken);

            _logger.LogInformation(
                "Written off {Quantity} of product {ProductId} from batch {BatchId}, warehouse {WarehouseId}",
                item.Quantity, item.ProductId, item.BatchId, request.WarehouseId);
        }

        writeOff.Approve(request.CreatedBy);

        await _context.WriteOffs.AddAsync(writeOff, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var item in writeOff.Items)
        {
            var integrationEvent = new StockWrittenOffEvent(writeOff, item);
            await _eventPublisher.PublishAsync(integrationEvent, cancellationToken);
        }

        await _realTimeNotifier.NotifyWarehouseUpdatedAsync(request.WarehouseId, cancellationToken);

        _logger.LogInformation("Stock written off successfully. Document: {DocumentId}", writeOff.Id);

        return new WriteOffStockResult { WriteOffId = writeOff.Id };
    }
}
