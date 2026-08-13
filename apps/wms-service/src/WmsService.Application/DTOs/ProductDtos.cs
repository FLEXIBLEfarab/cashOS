namespace WmsService.Application.DTOs;

public sealed record ProductDto
{
    public Guid Id { get; init; }
    public Guid ExternalId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Barcode { get; init; } = string.Empty;
    public string UnitOfMeasure { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}

public sealed record CreateProductRequest
{
    public Guid ExternalId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Barcode { get; init; } = string.Empty;
    public string UnitOfMeasure { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
}
