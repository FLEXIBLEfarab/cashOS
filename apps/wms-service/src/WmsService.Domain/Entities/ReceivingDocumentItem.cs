namespace WmsService.Domain.Entities;

public sealed class ReceivingDocumentItem : BaseEntity
{
    public Guid ReceivingDocumentId { get; private set; }
    public ReceivingDocument ReceivingDocument { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid? BatchId { get; private set; }
    public Batch? Batch { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? UnitPrice { get; private set; }
    public DateTime? ExpirationDate { get; private set; }

    private ReceivingDocumentItem() { } // EF Core

    public ReceivingDocumentItem(Guid receivingDocumentId, Guid productId, decimal quantity, decimal? unitPrice = null, DateTime? expirationDate = null, Guid? batchId = null)
    {
        ReceivingDocumentId = receivingDocumentId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        ExpirationDate = expirationDate;
        BatchId = batchId;
    }
}
