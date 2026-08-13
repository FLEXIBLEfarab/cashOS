using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Features.PreOrders.Commands;
using WmsService.Application.Features.PreOrders.Queries;
using WmsService.Domain.Entities;

namespace WmsService.API.Controllers;

[ApiController]
[Route("api/v1/preorders")]
public class PreOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public PreOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Список предзаказов.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PreOrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PreOrderDto>>> Get(
        [FromQuery] Guid? warehouseId,
        [FromQuery] PreOrderStatus? status,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetPreOrdersQuery(warehouseId, status), cancellationToken);
        return Ok(result);
    }

    /// <summary>Создать предзаказ.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    public async Task<ActionResult<Guid>> Create(
        [FromBody] CreatePreOrderCommand command,
        CancellationToken cancellationToken)
    {
        var id = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Get), new { }, id);
    }

    /// <summary>Изменить статус предзаказа (подтверждён / выполнен / отменён).</summary>
    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateStatus(
        [FromRoute] Guid id,
        [FromBody] PreOrderStatus status,
        CancellationToken cancellationToken)
    {
        await _mediator.Send(new UpdatePreOrderStatusCommand(id, status), cancellationToken);
        return NoContent();
    }
}
