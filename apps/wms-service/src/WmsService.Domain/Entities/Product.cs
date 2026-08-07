namespace WmsService.Domain.Entities;

public sealed class Product : BaseEntity
{
    public Guid ExternalId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Barcode { get; private set; } = string.Empty;
    public string UnitOfMeasure { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public ICollection<Stock> Stocks { get; private set; } = new List<Stock>();
    public ICollection<Batch> Batches { get; private set; } = new List<Batch>();
    public ICollection<StockMovement> StockMovements { get; private set; } = new List<StockMovement>();

    private Product() { } // EF Core

    public Product(Guid externalId, string name, string barcode, string unitOfMeasure, string category)
    {
        ExternalId = externalId;
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Barcode = barcode ?? throw new ArgumentNullException(nameof(barcode));
        UnitOfMeasure = unitOfMeasure ?? throw new ArgumentNullException(nameof(unitOfMeasure));
        Category = category ?? string.Empty;
        IsActive = true;
    }

    public void Update(string name, string barcode, string unitOfMeasure, string category)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Barcode = barcode ?? throw new ArgumentNullException(nameof(barcode));
        UnitOfMeasure = unitOfMeasure ?? throw new ArgumentNullException(nameof(unitOfMeasure));
        Category = category ?? string.Empty;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
