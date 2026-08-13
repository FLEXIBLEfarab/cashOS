using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;
using WmsService.Domain.Events;

namespace WmsService.Application.Features.StockOperations.Commands.ReceiveStock;

public sealed record ReceiveStockCommand : IRequest<ReceiveStockResponse>
{
    public Guid WarehouseId { get; init; }
    public string DocumentNumber { get; init; } = string.Empty;
    public Guid? SupplierId { get; init; }
    public List<ReceiveStockItem> Items { get; init; } = new();
    public string CreatedBy { get; init; } = string.Empty;
}

public sealed record ReceiveStockItem
{
    public Guid ProductId { get; init; }
    public decimal Quantity { get; init; }
    public decimal? UnitPrice { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public DateTime? ProductionDate { get; init; }
    public string? BatchNumber { get; init; }
}

public sealed record ReceiveStockResponse
{
    public Guid ReceivingDocumentId { get; init; }
    public List<Guid> BatchIds { get; init; } = new();
}

public sealed class ReceiveStockCommandHandler : IRequestHandler<ReceiveStockCommand, ReceiveStockResponse>
{
    private readonly IRepository<ReceivingDocument> _receivingDocuments;
    private readonly IBatchRepository _batchRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IRepository<StockMovement> _movements;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventPublisher _eventPublisher;
    private readonly ICurrentUserService _currentUser;

    public ReceiveStockCommandHandler(
        IRepository<ReceivingDocument> receivingDocuments,
        IBatchRepository batchRepository,
        IStockRepository stockRepository,
        IRepository<StockMovement> movements,
        IUnitOfWork unitOfWork,
        IEventPublisher eventPublisher,
        ICurrentUserService currentUser)
    {
        _receivingDocuments = receivingDocuments;
        _batchRepository = batchRepository;
        _stockRepository = stockRepository;
        _movements = movements;
        _unitOfWork = unitOfWork;
        _eventPublisher = eventPublisher;
        _currentUser = currentUser;
    }

    public async Task<ReceiveStockResponse> Handle(ReceiveStockCommand request, CancellationToken cancellationToken)
    {
        var document = new ReceivingDocument
        {
            DocumentNumber = request.DocumentNumber,
            WarehouseId = request.WarehouseId,
            SupplierId = request.SupplierId,
            DocumentDate = DateTime.UtcNow
        };
        await _receivingDocuments.AddAsync(document, cancellationToken);

        var batchIds = new List<Guid>();
        var publishedBatches = new List<(Batch Batch, decimal Quantity)>();

        foreach (var item in request.Items)
        {
            var batchNumber = string.IsNullOrWhiteSpace(item.BatchNumber)
                ? $"{request.DocumentNumber}-{Guid.NewGuid():N}"[..20]
                : item.BatchNumber;

            var batch = new Batch(
                item.ProductId,
                request.WarehouseId,
                batchNumber,
                item.Quantity,
                item.ExpirationDate,
                item.ProductionDate,
                request.SupplierId);

            await _batchRepository.AddAsync(batch, cancellationToken);
            batchIds.Add(batch.Id);
            publishedBatches.Add((batch, item.Quantity));

            document.Items.Add(new ReceivingDocumentItem
            {
                ReceivingDocumentId = document.Id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Price = item.UnitPrice,
                BatchNumber = batchNumber,
                ExpirationDate = item.ExpirationDate
            });

            Stock stock;
            var existingStock = await _stockRepository.GetByProductAndWarehouseAsync(item.ProductId, request.WarehouseId, cancellationToken);
            if (existingStock is null)
            {
                stock = new Stock(item.ProductId, request.WarehouseId, item.Quantity);
                await _stockRepository.AddAsync(stock, cancellationToken);
            }
            else
            {
                existingStock.Increase(item.Quantity);
                stock = existingStock;
            }

            await _movements.AddAsync(new StockMovement
            {
                StockId = stock.Id,
                BatchId = batch.Id,
                Type = MovementType.Receive,
                Quantity = item.Quantity,
                Reason = $"Приёмка по документу {request.DocumentNumber}",
                TargetWarehouseId = request.WarehouseId,
                PerformedByUserId = _currentUser.UserId,
                PerformedByUserName = _currentUser.UserName
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var (batch, quantity) in publishedBatches)
        {
            await _eventPublisher.PublishAsync(new StockReceivedEvent(batch, quantity), cancellationToken);
        }

        return new ReceiveStockResponse
        {
            ReceivingDocumentId = document.Id,
            BatchIds = batchIds
        };
    }
}
