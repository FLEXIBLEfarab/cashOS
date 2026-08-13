using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;
using WmsService.Domain.Events;

namespace WmsService.Application.Features.StockOperations.Commands.WriteOffStock;

public sealed record WriteOffStockCommand : IRequest<WriteOffStockResponse>
{
    public Guid WarehouseId { get; init; }
    public string DocumentNumber { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public List<WriteOffStockItem> Items { get; init; } = new();
    public string CreatedBy { get; init; } = string.Empty;
}

public sealed record WriteOffStockItem
{
    public Guid ProductId { get; init; }
    public Guid BatchId { get; init; }
    public decimal Quantity { get; init; }
    public string? Reason { get; init; }
}

public sealed record WriteOffStockResponse
{
    public Guid WriteOffId { get; init; }
}

public sealed class WriteOffStockCommandHandler : IRequestHandler<WriteOffStockCommand, WriteOffStockResponse>
{
    private readonly IRepository<WriteOff> _writeOffs;
    private readonly IBatchRepository _batchRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IRepository<StockMovement> _movements;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventPublisher _eventPublisher;
    private readonly ICurrentUserService _currentUser;

    public WriteOffStockCommandHandler(
        IRepository<WriteOff> writeOffs,
        IBatchRepository batchRepository,
        IStockRepository stockRepository,
        IRepository<StockMovement> movements,
        IUnitOfWork unitOfWork,
        IEventPublisher eventPublisher,
        ICurrentUserService currentUser)
    {
        _writeOffs = writeOffs;
        _batchRepository = batchRepository;
        _stockRepository = stockRepository;
        _movements = movements;
        _unitOfWork = unitOfWork;
        _eventPublisher = eventPublisher;
        _currentUser = currentUser;
    }

    public async Task<WriteOffStockResponse> Handle(WriteOffStockCommand request, CancellationToken cancellationToken)
    {
        var writeOff = new WriteOff
        {
            DocumentNumber = request.DocumentNumber,
            WarehouseId = request.WarehouseId,
            Reason = request.Reason,
            DocumentDate = DateTime.UtcNow
        };
        await _writeOffs.AddAsync(writeOff, cancellationToken);

        var publishedItems = new List<WriteOffItem>();

        foreach (var item in request.Items)
        {
            var batch = await _batchRepository.GetByIdAsync(item.BatchId, cancellationToken)
                ?? throw new InvalidOperationException($"Batch {item.BatchId} not found");

            batch.ReduceQuantity(item.Quantity);

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(item.ProductId, request.WarehouseId, cancellationToken);
            stock?.Decrease(item.Quantity);

            var writeOffItem = new WriteOffItem
            {
                WriteOffId = writeOff.Id,
                ProductId = item.ProductId,
                BatchId = item.BatchId,
                Quantity = item.Quantity,
                Reason = item.Reason
            };
            writeOff.Items.Add(writeOffItem);
            publishedItems.Add(writeOffItem);

            if (stock is not null)
            {
                await _movements.AddAsync(new StockMovement
                {
                    StockId = stock.Id,
                    BatchId = item.BatchId,
                    Type = MovementType.WriteOff,
                    Quantity = item.Quantity,
                    Reason = item.Reason ?? request.Reason,
                    SourceWarehouseId = request.WarehouseId,
                    PerformedByUserId = _currentUser.UserId,
                    PerformedByUserName = _currentUser.UserName
                }, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var writeOffItem in publishedItems)
        {
            await _eventPublisher.PublishAsync(new StockWrittenOffEvent(writeOff, writeOffItem), cancellationToken);
        }

        return new WriteOffStockResponse { WriteOffId = writeOff.Id };
    }
}
