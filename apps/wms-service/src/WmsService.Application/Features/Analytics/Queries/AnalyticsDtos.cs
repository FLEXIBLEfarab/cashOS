namespace WmsService.Application.Features.Analytics.Queries;

public sealed record DashboardDto(
    int TotalWarehouses,
    int TotalProducts,
    decimal TotalStockValue,
    int ExpiredBatchesCount,
    int ExpiringSoonCount,
    int LowStockCount);

public sealed record SalesDto(
    Guid ProductId,
    string ProductName,
    decimal TotalSold,
    decimal TotalRevenue,
    DateTime PeriodStart,
    DateTime PeriodEnd);

public sealed record StaffProductivityDto(
    Guid UserId,
    string UserName,
    int OperationsCount,
    decimal TotalQuantityHandled);

public sealed record NetworkDto(
    Guid WarehouseId,
    string WarehouseName,
    decimal Turnover,
    decimal StockValue,
    int ProductCount);
