using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

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
    private readonly IUnitOfWork _unitOfWork;

    public WriteOffStockCommandHandler(
        IRepository<WriteOff> writeOffs,
        IBatchRepository batchRepository,
        IStockRepository stockRepository,
        IUnitOfWork unitOfWork)
    {
        _writeOffs = writeOffs;
        _batchRepository = batchRepository;
        _stockRepository = stockRepository;
        _unitOfWork = unitOfWork;
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

        foreach (var item in request.Items)
        {
            var batch = await _batchRepository.GetByIdAsync(item.BatchId, cancellationToken)
                ?? throw new InvalidOperationException($"Batch {item.BatchId} not found");

            batch.ReduceQuantity(item.Quantity);

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(item.ProductId, request.WarehouseId, cancellationToken);
            stock?.Decrease(item.Quantity);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new WriteOffStockResponse { WriteOffId = writeOff.Id };
    }
}
