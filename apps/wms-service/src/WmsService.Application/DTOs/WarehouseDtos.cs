namespace WmsService.Application.DTOs;

public sealed record WarehouseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed record CreateWarehouseRequest
{
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
}

public sealed record UpdateWarehouseRequest
{
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
}
