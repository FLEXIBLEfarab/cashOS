using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.Analytics.Queries;

public sealed record GetStaffProductivityQuery(
    DateTime From,
    DateTime To,
    Guid? WarehouseId = null) : IRequest<IReadOnlyList<StaffProductivityDto>>;

public sealed class GetStaffProductivityQueryHandler
    : IRequestHandler<GetStaffProductivityQuery, IReadOnlyList<StaffProductivityDto>>
{
    private readonly IRepository<StockMovement> _movementRepo;

    public GetStaffProductivityQueryHandler(IRepository<StockMovement> movementRepo)
    {
        _movementRepo = movementRepo;
    }

    public async Task<IReadOnlyList<StaffProductivityDto>> Handle(GetStaffProductivityQuery request, CancellationToken cancellationToken)
    {
        var movements = await _movementRepo.FindAsync(
            m => m.CreatedAt >= request.From && m.CreatedAt <= request.To
                 && (!request.WarehouseId.HasValue
                     || m.SourceWarehouseId == request.WarehouseId
                     || m.TargetWarehouseId == request.WarehouseId),
            cancellationToken);

        // NOTE: PerformedByUserId/UserName приходят из ICurrentUserService, который
        // читает claim "sub" из HttpContext.User. JWT-аутентификация в WMS ещё не
        // подключена (это зона Auth у тимлида) — до её подключения тут будет одна
        // группа "Unknown". Как только Auth появится на этом сервисе, группы станут
        // реальными без единой правки этого кода.
        return movements
            .GroupBy(m => new { UserId = m.PerformedByUserId ?? "unknown", UserName = m.PerformedByUserName ?? "Unknown" })
            .Select(g => new StaffProductivityDto(
                Guid.TryParse(g.Key.UserId, out var userId) ? userId : Guid.Empty,
                g.Key.UserName,
                g.Count(),
                g.Sum(m => m.Quantity)))
            .OrderByDescending(dto => dto.OperationsCount)
            .ToList();
    }
}
