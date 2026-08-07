using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Commands;
using WmsService.Application.DTOs;
using WmsService.Application.Queries;

namespace WmsService.API.Controllers;

/// <summary>
/// Управление складскими операциями: приёмка, списание, перемещение, остатки.
/// </summary>
[ApiController]
[Route("v1/[controller]")]
[Produces("application/json")]
public sealed class StockController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<StockController> _logger;

    public StockController(IMediator mediator, ILogger<StockController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Приёмка товара на склад.
    /// </summary>
    /// <param name="request">Данные приёмки.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Идентификатор созданного документа приёмки и список созданных партий.</returns>
    /// <response code="200">Приёмка успешно выполнена.</response>
    /// <response code="400">Некорректные данные запроса.</response>
    /// <response code="404">Склад или товар не найден.</response>
    [HttpPost("receive")]
    [ProducesResponseType(typeof(ReceiveStockResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReceiveStockResult>> ReceiveStock(
        [FromBody] ReceiveStockRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Receiving stock for warehouse {WarehouseId}", request.WarehouseId);
        var result = await _mediator.Send(new ReceiveStockCommand(request), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Списание товара со склада.
    /// </summary>
    /// <param name="request">Данные списания.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Идентификатор созданного документа списания.</returns>
    /// <response code="200">Списание успешно выполнено.</response>
    /// <response code="400">Некорректные данные или недостаточно остатков.</response>
    /// <response code="404">Склад, партия или товар не найдены.</response>
    [HttpPost("write-off")]
    [ProducesResponseType(typeof(WriteOffStockResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WriteOffStockResult>> WriteOffStock(
        [FromBody] WriteOffStockRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Writing off stock from warehouse {WarehouseId}", request.WarehouseId);
        var result = await _mediator.Send(new WriteOffStockCommand(request), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Перемещение товара между складами.
    /// </summary>
    /// <param name="request">Данные перемещения.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Идентификаторы созданных движений (списание с источника, приёмка в назначение).</returns>
    /// <response code="200">Перемещение успешно выполнено.</response>
    /// <response code="400">Некорректные данные или недостаточно остатков.</response>
    /// <response code="404">Склад или товар не найден.</response>
    [HttpPost("move")]
    [ProducesResponseType(typeof(MoveStockResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MoveStockResult>> MoveStock(
        [FromBody] MoveStockRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Moving stock {ProductId} from {Source} to {Destination}",
            request.ProductId, request.SourceWarehouseId, request.DestinationWarehouseId);
        var result = await _mediator.Send(new MoveStockCommand(request), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Получить остатки товаров на складе.
    /// </summary>
    /// <param name="warehouseId">Идентификатор склада.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Список остатков с доступным количеством.</returns>
    /// <response code="200">Список остатков.</response>
    [HttpGet("warehouse/{warehouseId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<StockDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<StockDto>>> GetStockByWarehouse(
        [FromRoute] Guid warehouseId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStockByWarehouseQuery(warehouseId), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Получить историю движений товаров на складе за период.
    /// </summary>
    /// <param name="warehouseId">Идентификатор склада.</param>
    /// <param name="from">Начало периода (UTC).</param>
    /// <param name="to">Конец периода (UTC).</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Список движений.</returns>
    /// <response code="200">Список движений.</response>
    [HttpGet("movements/{warehouseId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<StockMovementDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<StockMovementDto>>> GetMovements(
        [FromRoute] Guid warehouseId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStockMovementsQuery(warehouseId, from, to), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Получить список партий на складе.
    /// </summary>
    /// <param name="warehouseId">Идентификатор склада.</param>
    /// <param name="productId">Идентификатор товара (опционально).</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Список партий с остатками и сроками годности.</returns>
    /// <response code="200">Список партий.</response>
    [HttpGet("batches/{warehouseId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<BatchDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<BatchDto>>> GetBatches(
        [FromRoute] Guid warehouseId,
        [FromQuery] Guid? productId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetBatchesQuery(warehouseId, productId), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Получить товары с истекающим сроком годности.
    /// </summary>
    /// <param name="warehouseId">Идентификатор склада.</param>
    /// <param name="days">Количество дней до истечения срока.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Список товаров с количеством дней до истечения.</returns>
    /// <response code="200">Список товаров.</response>
    [HttpGet("expiring/{warehouseId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<ExpiringProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ExpiringProductDto>>> GetExpiringProducts(
        [FromRoute] Guid warehouseId,
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetExpiringProductsQuery(warehouseId, days), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Получить просроченные товары на складе.
    /// </summary>
    /// <param name="warehouseId">Идентификатор склада.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Список просроченных товаров.</returns>
    /// <response code="200">Список просроченных товаров.</response>
    [HttpGet("expired/{warehouseId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<ExpiringProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ExpiringProductDto>>> GetExpiredProducts(
        [FromRoute] Guid warehouseId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetExpiredProductsQuery(warehouseId), cancellationToken);
        return Ok(result);
    }
}
