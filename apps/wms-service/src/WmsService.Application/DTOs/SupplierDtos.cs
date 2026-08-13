namespace WmsService.Application.DTOs;

public sealed record SupplierDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ContactInfo { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}

public sealed record CreateSupplierRequest
{
    public string Name { get; init; } = string.Empty;
    public string ContactInfo { get; init; } = string.Empty;
}
