namespace WmsService.Application.Features.ExpirationChecks.Queries;

public sealed record ExpirationCheckLogDto(
    Guid Id,
    Guid BatchId,
    string BatchNumber,
    string ProductName,
    string WarehouseName,
    DateTime CheckDate,
    int? DaysUntilExpiration,
    bool IsExpired,
    bool IsExpiringSoon,
    string? ActionTaken,
    DateTime CreatedAt);

public sealed record ExpirationCheckLogsResponse(
    IReadOnlyList<ExpirationCheckLogDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
