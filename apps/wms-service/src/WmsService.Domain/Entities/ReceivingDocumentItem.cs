namespace WmsService.Domain.Entities;

public sealed class ReceivingDocumentItem : BaseEntity
{
    public Guid ReceivingDocumentId { get; set; }
    public ReceivingDocument ReceivingDocument { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal? Price { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpirationDate { get; set; }
}
