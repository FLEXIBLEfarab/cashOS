namespace WmsService.Domain.Entities;

public sealed class Warehouse : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Address { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public ICollection<Stock> Stocks { get; private set; } = new List<Stock>();
    public ICollection<Batch> Batches { get; private set; } = new List<Batch>();
    public ICollection<StockMovement> StockMovements { get; private set; } = new List<StockMovement>();

    private Warehouse() { } // EF Core

    public Warehouse(string name, string address)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Address = address ?? throw new ArgumentNullException(nameof(address));
        IsActive = true;
    }

    public void Update(string name, string address)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Address = address ?? throw new ArgumentNullException(nameof(address));
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
