using MediatR;
using Microsoft.EntityFrameworkCore;
using WmsService.Application.DTOs;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Queries;

namespace WmsService.Application.Handlers;

public sealed class GetWarehousesQueryHandler :
    IRequestHandler<GetWarehousesQuery, IReadOnlyList<WarehouseDto>>,
    IRequestHandler<GetWarehouseByIdQuery, WarehouseDto?>
{
    private readonly IWmsDbContext _context;

    public GetWarehousesQueryHandler(IWmsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<WarehouseDto>> Handle(GetWarehousesQuery query, CancellationToken cancellationToken)
    {
        return await _context.Warehouses
            .AsNoTracking()
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Address = w.Address,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<WarehouseDto?> Handle(GetWarehouseByIdQuery query, CancellationToken cancellationToken)
    {
        return await _context.Warehouses
            .AsNoTracking()
            .Where(w => w.Id == query.Id)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Address = w.Address,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
