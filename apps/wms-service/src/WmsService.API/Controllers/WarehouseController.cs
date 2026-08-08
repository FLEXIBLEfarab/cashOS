using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WarehouseController : ControllerBase
{
    private readonly IRepository<Warehouse> _warehouseRepo;
    private readonly IWmsNotificationService _notificationService;

    public WarehouseController(IRepository<Warehouse> warehouseRepo, IWmsNotificationService notificationService)
    {
        _warehouseRepo = warehouseRepo;
        _notificationService = notificationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ICollection<Warehouse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ICollection<Warehouse>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _warehouseRepo.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Warehouse), StatusCodes.Status200OK)]
    public async Task<ActionResult<Warehouse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _warehouseRepo.GetByIdAsync(id, cancellationToken);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Warehouse), StatusCodes.Status201Created)]
    public async Task<ActionResult<Warehouse>> Create(
        [FromBody] Warehouse warehouse,
        CancellationToken cancellationToken)
    {
        await _warehouseRepo.AddAsync(warehouse, cancellationToken);
        await _notificationService.NotifyWarehouseUpdatedAsync(warehouse.Id, warehouse.Name, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }
}
