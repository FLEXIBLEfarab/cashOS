namespace WmsService.Domain.Entities;

public sealed class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    public string? Phone { get; set; }
}
