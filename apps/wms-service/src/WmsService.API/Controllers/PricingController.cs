using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Features.Pricing.Commands;
using WmsService.Application.Features.Pricing.Queries;

namespace WmsService.API.Controllers;

[ApiController]
[Route("api/v1/pricing/seasonal")]
public class PricingController : ControllerBase
{
    private readonly IMediator _mediator;

    public PricingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Список сезонных прайс-листов.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SeasonalPriceListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SeasonalPriceListDto>>> GetSeasonal(
        [FromQuery] Guid? productId,
        [FromQuery] bool activeOnly = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetSeasonalPriceListsQuery(productId, activeOnly), cancellationToken);
        return Ok(result);
    }

    /// <summary>Текущая активная сезонная цена на товар (если действует).</summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(decimal?), StatusCodes.Status200OK)]
    public async Task<ActionResult<decimal?>> GetActive(
        [FromQuery] Guid productId,
        [FromQuery] Guid? warehouseId,
        CancellationToken cancellationToken = default)
    {
        var price = await _mediator.Send(new GetActiveSeasonalPriceQuery(productId, warehouseId), cancellationToken);
        return Ok(price);
    }

    /// <summary>Создать сезонный прайс-лист.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    public async Task<ActionResult<Guid>> Create(
        [FromBody] CreateSeasonalPriceListCommand command,
        CancellationToken cancellationToken)
    {
        var id = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetSeasonal), new { productId = command.ProductId }, id);
    }
}
