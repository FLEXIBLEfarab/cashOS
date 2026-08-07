using MediatR;
using Microsoft.Extensions.Logging;
using WmsService.Application.Commands;
using WmsService.Application.Common.Exceptions;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;
using WmsService.Domain.Enums;
using WmsService.Domain.Events;

namespace WmsService.Application.Handlers;

public sealed class ReceiveStockCommandHandler : IRequestHandler<ReceiveStockCommand, ReceiveStockResult>
{
    private readonly IWmsDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStockRepository _stockRepository;
    private readonly IEventPublisher _eventPublisher;
    private readonly IRealTimeNotifier _realTimeNotifier;
    private readonly ILogger<ReceiveStockCommandHandler> _logger;

    public ReceiveStockCommandHandler(
        IWmsDbContext context,
        IUnitOfWork unitOfWork,
        IStockRepository stockRepository,
        IEventPublisher eventPublisher,
        IRealTimeNotifier realTimeNotifier,
        ILogger<ReceiveStockCommandHandler> logger)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _stockRepository = stockRepository;
        _eventPublisher = eventPublisher;
        _realTimeNotifier = realTimeNotifier;
        _logger = logger;
    }

    public async Task<ReceiveStockResult> Handle(ReceiveStockCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException("Warehouse", request.WarehouseId);

        if (!warehouse.IsActive)
            throw new WmsException("Warehouse is not active");

        var document = new ReceivingDocument(request.DocumentNumber, request.WarehouseId, request.SupplierId, request.CreatedBy);

        var batchIds = new List<Guid>();

        foreach (var item in request.Items)
        {
            var product = await _context.Products.FindAsync(new object[] { item.ProductId }, cancellationToken)
                ?? throw new NotFoundException("Product", item.ProductId);

            var batchNumber = item.BatchNumber ?? $"BN-{Guid.NewGuid():N}";
            var batch = new Batch(
                item.ProductId,
                request.WarehouseId,
                batchNumber,
                item.Quantity,
                item.ExpirationDate,
                item.ProductionDate,
                request.SupplierId);

            await _context.Batches.AddAsync(batch, cancellationToken);

            var documentItem = new ReceivingDocumentItem(document.Id, item.ProductId, item.Quantity, item.UnitPrice, item.ExpirationDate, batch.Id);
            document.Items.Add(documentItem);

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(item.ProductId, request.WarehouseId, cancellationToken);
            if (stock is null)
            {
                stock = new Stock(item.ProductId, request.WarehouseId, item.Quantity);
                await _stockRepository.AddAsync(stock, cancellationToken);
            }
            else
            {
                stock.Increase(item.Quantity);
                await _stockRepository.UpdateAsync(stock, cancellationToken);
            }

            var movement = new StockMovement(
                item.ProductId,
                request.WarehouseId,
                MovementType.Receive,
                item.Quantity,
                document.Id.ToString(),
                "ReceivingDocument",
                request.CreatedBy,
                batch.Id,
                item.UnitPrice,
                item.UnitPrice * item.Quantity);

            await _context.StockMovements.AddAsync(movement, cancellationToken);

            batchIds.Add(batch.Id);

            _logger.LogInformation(
                "Received {Quantity} of product {ProductId} into warehouse {WarehouseId}, batch {BatchId}",
                item.Quantity, item.ProductId, request.WarehouseId, batch.Id);
        }

        document.SetTotalAmount(document.Items.Sum(i => (i.UnitPrice ?? 0m) * i.Quantity));
        document.Process();

        await _context.ReceivingDocuments.AddAsync(document, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var batchId in batchIds)
        {
            var batch = await _context.Batches.FindAsync(new object[] { batchId }, cancellationToken);
            if (batch is not null)
            {
                var integrationEvent = new StockReceivedEvent(batch, batch.InitialQuantity);
                await _eventPublisher.PublishAsync(integrationEvent, cancellationToken);
            }
        }

        await _realTimeNotifier.NotifyWarehouseUpdatedAsync(request.WarehouseId, cancellationToken);

        _logger.LogInformation("Stock received successfully. Document: {DocumentId}", document.Id);

        return new ReceiveStockResult
        {
            ReceivingDocumentId = document.Id,
            BatchIds = batchIds
        };
    }
}
