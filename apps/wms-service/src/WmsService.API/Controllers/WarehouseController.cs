using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.DTOs;
using WmsService.Application.Queries;

namespace WmsService.API.Controllers;

/// <summary>
/// Управление складами: просмотр, создание (чтение остатков через StockController).
/// </summary>
[ApiController]
[Route("v1/[controller]")]
[Produces("application/json")]
public sealed class WarehouseController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<WarehouseController> _logger;

    public WarehouseController(IMediator mediator, ILogger<WarehouseController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Получить список всех складов.
    /// </summary>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Список складов.</returns>
    /// <response code="200">Список складов.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<WarehouseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<WarehouseDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetWarehousesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Получить склад по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор склада.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Данные склада.</returns>
    /// <response code="200">Склад найден.</response>
    /// <response code="404">Склад не найден.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(WarehouseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WarehouseDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetWarehouseByIdQuery(id), cancellationToken);
        if (result is null)
            return NotFound();
        return Ok(result);
    }
}
