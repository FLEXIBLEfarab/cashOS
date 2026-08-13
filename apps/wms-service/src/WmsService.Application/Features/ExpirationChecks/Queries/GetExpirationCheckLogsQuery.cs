using MediatR;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Application.Features.ExpirationChecks.Queries;

public sealed record GetExpirationCheckLogsQuery(
    Guid? WarehouseId = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null,
    bool? IsExpired = null,
    bool? IsExpiringSoon = null,
    int Page = 1,
    int PageSize = 50) : IRequest<ExpirationCheckLogsResponse>;

public sealed class GetExpirationCheckLogsQueryHandler
    : IRequestHandler<GetExpirationCheckLogsQuery, ExpirationCheckLogsResponse>
{
    private readonly IExpirationCheckLogRepository _repository;

    public GetExpirationCheckLogsQueryHandler(IExpirationCheckLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<ExpirationCheckLogsResponse> Handle(
        GetExpirationCheckLogsQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetFilteredAsync(
            request.WarehouseId,
            request.DateFrom,
            request.DateTo,
            request.IsExpired,
            request.IsExpiringSoon,
            request.Page,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(l => new ExpirationCheckLogDto(
            l.Id,
            l.BatchId,
            l.Batch.BatchNumber,
            l.Product.Name,
            l.Warehouse.Name,
            l.CheckDate,
            l.DaysUntilExpiration,
            l.IsExpired,
            l.IsExpiringSoon,
            l.ActionTaken,
            l.CreatedAt)).ToList();

        return new ExpirationCheckLogsResponse(dtos, totalCount, request.Page, request.PageSize);
    }
}
