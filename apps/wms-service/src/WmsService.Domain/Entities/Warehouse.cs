namespace WmsService.Domain.Entities;

public sealed class Warehouse : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}
