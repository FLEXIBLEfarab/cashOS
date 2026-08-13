using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Features.Analytics.Queries;

namespace WmsService.API.Controllers;

[ApiController]
[Route("api/v1/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IReportService _reportService;

    public AnalyticsController(IMediator mediator, IReportService reportService)
    {
        _mediator = mediator;
        _reportService = reportService;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(DashboardDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardDto>> Dashboard(
        [FromQuery] Guid? warehouseId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetDashboardQuery(warehouseId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("sales")]
    [ProducesResponseType(typeof(IReadOnlyList<SalesDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SalesDto>>> Sales(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] Guid? warehouseId,
        [FromQuery] Guid? productId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetSalesQuery(from, to, warehouseId, productId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("staff")]
    [ProducesResponseType(typeof(IReadOnlyList<StaffProductivityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<StaffProductivityDto>>> Staff(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] Guid? warehouseId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStaffProductivityQuery(from, to, warehouseId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("network")]
    [ProducesResponseType(typeof(IReadOnlyList<NetworkDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<NetworkDto>>> Network(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetNetworkQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("sales/export")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportSales(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] Guid? warehouseId,
        [FromQuery] string format = "excel",
        CancellationToken cancellationToken = default)
    {
        var data = await _mediator.Send(new GetSalesQuery(from, to, warehouseId), cancellationToken);

        if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
        {
            var pdf = await _reportService.GenerateTablePdfAsync(data, $"Sales Report {from:d} - {to:d}", cancellationToken);
            return File(pdf, "application/pdf", $"sales_{from:yyyyMMdd}_{to:yyyyMMdd}.pdf");
        }

        var excel = await _reportService.GenerateExcelAsync(data, "Sales", cancellationToken);
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"sales_{from:yyyyMMdd}_{to:yyyyMMdd}.xlsx");
    }
}
