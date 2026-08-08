using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Features.StockOperations.Commands.MoveStock;
using WmsService.Application.Features.StockOperations.Commands.ReceiveStock;
using WmsService.Application.Features.StockOperations.Commands.WriteOffStock;
using WmsService.Application.Features.StockOperations.Queries;

namespace WmsService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class StockController : ControllerBase
{
    private readonly IMediator _mediator;

    public StockController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<StockDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<StockDto>>> GetAll(
        [FromQuery] Guid? warehouseId,
        [FromQuery] Guid? productId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStockQuery(warehouseId, productId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("movements")]
    [ProducesResponseType(typeof(IReadOnlyList<StockMovement>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<StockMovement>>> GetMovements(
        [FromQuery] Guid? stockId,
        [FromQuery] Guid? warehouseId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStockMovementsQuery(stockId, warehouseId), cancellationToken);
        return Ok(result);
    }

    [HttpPost("receive")]
    [ProducesResponseType(typeof(ReceiveStockResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReceiveStockResponse>> Receive(
        [FromBody] ReceiveStockCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("writeoff")]
    [ProducesResponseType(typeof(WriteOffStockResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<WriteOffStockResponse>> WriteOff(
        [FromBody] WriteOffStockCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("move")]
    [ProducesResponseType(typeof(MoveStockResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<MoveStockResponse>> Move(
        [FromBody] MoveStockCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }
}
