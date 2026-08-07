namespace WmsService.Domain.Entities;

public sealed class Supplier : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string ContactInfo { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public ICollection<ReceivingDocument> ReceivingDocuments { get; private set; } = new List<ReceivingDocument>();

    private Supplier() { } // EF Core

    public Supplier(string name, string contactInfo)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        ContactInfo = contactInfo ?? string.Empty;
        IsActive = true;
    }

    public void Update(string name, string contactInfo)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        ContactInfo = contactInfo ?? string.Empty;
        UpdatedAt = DateTime.UtcNow;
    }
}
