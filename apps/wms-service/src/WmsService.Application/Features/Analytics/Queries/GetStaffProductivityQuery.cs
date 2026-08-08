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
            m => m.CreatedAt >= request.From && m.CreatedAt <= request.To,
            cancellationToken);
        return new List<StaffProductivityDto>();
    }
}
