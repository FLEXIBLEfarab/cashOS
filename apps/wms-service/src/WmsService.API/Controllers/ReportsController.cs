using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Features.Reports.Queries;
using WmsService.Application.Features.StockOperations.Queries;

namespace WmsService.API.Controllers;

/// <summary>
/// Экспорт отчётов по складу. На текущем этапе экспорт отдаёт CSV
/// (через уже существующий IReportService.GenerateExcelAsync, который
/// внутри использует CsvHelper) — файл открывается в Excel, но это не
/// "настоящий" .xlsx. Апгрейд на реальный .xlsx через ClosedXML и
/// реальный PDF через QuestPDF — следующий шаг, сервис сейчас
/// содержит заглушку для PDF.
/// </summary>
[ApiController]
[Route("api/v1/reports")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IReportService _reportService;

    public ReportsController(IMediator mediator, IReportService reportService)
    {
        _mediator = mediator;
        _reportService = reportService;
    }

    /// <summary>Отчёт по текущим остаткам.</summary>
    [HttpGet("stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockReport(
        [FromQuery] Guid? warehouseId,
        [FromQuery] Guid? productId,
        CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetStockQuery(warehouseId, productId), cancellationToken);
        var bytes = await _reportService.GenerateExcelAsync(data, "Stock", cancellationToken);
        return File(bytes, "text/csv", "stock-report.csv");
    }

    /// <summary>Отчёт по движениям товара.</summary>
    [HttpGet("movements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMovementsReport(
        [FromQuery] Guid? warehouseId,
        [FromQuery] Guid? stockId,
        CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetStockMovementsQuery(stockId, warehouseId), cancellationToken);
        var bytes = await _reportService.GenerateExcelAsync(data, "Movements", cancellationToken);
        return File(bytes, "text/csv", "movements-report.csv");
    }

    /// <summary>Отчёт по просроченным партиям.</summary>
    [HttpGet("expired")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExpiredReport(
        [FromQuery] Guid? warehouseId,
        CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetExpiredBatchesReportQuery(warehouseId), cancellationToken);
        var bytes = await _reportService.GenerateExcelAsync(data, "Expired", cancellationToken);
        return File(bytes, "text/csv", "expired-report.csv");
    }
}
