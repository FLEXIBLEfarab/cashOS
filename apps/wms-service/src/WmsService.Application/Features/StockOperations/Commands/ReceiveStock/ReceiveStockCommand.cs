using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

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
    private readonly IUnitOfWork _unitOfWork;

    public ReceiveStockCommandHandler(
        IRepository<ReceivingDocument> receivingDocuments,
        IBatchRepository batchRepository,
        IStockRepository stockRepository,
        IUnitOfWork unitOfWork)
    {
        _receivingDocuments = receivingDocuments;
        _batchRepository = batchRepository;
        _stockRepository = stockRepository;
        _unitOfWork = unitOfWork;
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

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(item.ProductId, request.WarehouseId, cancellationToken);
            if (stock is null)
            {
                stock = new Stock(item.ProductId, request.WarehouseId, item.Quantity);
                await _stockRepository.AddAsync(stock, cancellationToken);
            }
            else
            {
                stock.Increase(item.Quantity);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ReceiveStockResponse
        {
            ReceivingDocumentId = document.Id,
            BatchIds = batchIds
        };
    }
}
