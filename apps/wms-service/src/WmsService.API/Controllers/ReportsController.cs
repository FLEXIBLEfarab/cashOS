using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Common.Interfaces;
using WmsService.Application.Features.Reports.Queries;
using WmsService.Application.Features.StockOperations.Queries;

namespace WmsService.API.Controllers;

/// <summary>
/// Экспорт отчётов по складу в Excel (.xlsx, ClosedXML) или PDF (QuestPDF).
/// </summary>
[ApiController]
[Route("api/v1/reports")]
public class ReportsController : ControllerBase
{
    private const string ExcelContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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
        [FromQuery] string format = "excel",
        CancellationToken cancellationToken = default)
    {
        var data = await _mediator.Send(new GetStockQuery(warehouseId, productId), cancellationToken);
        return await ExportAsync(data, "Stock", "stock-report", format, cancellationToken);
    }

    /// <summary>Отчёт по движениям товара.</summary>
    [HttpGet("movements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMovementsReport(
        [FromQuery] Guid? warehouseId,
        [FromQuery] Guid? stockId,
        [FromQuery] string format = "excel",
        CancellationToken cancellationToken = default)
    {
        var data = await _mediator.Send(new GetStockMovementsQuery(stockId, warehouseId), cancellationToken);
        return await ExportAsync(data, "Movements", "movements-report", format, cancellationToken);
    }

    /// <summary>Отчёт по просроченным партиям.</summary>
    [HttpGet("expired")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExpiredReport(
        [FromQuery] Guid? warehouseId,
        [FromQuery] string format = "excel",
        CancellationToken cancellationToken = default)
    {
        var data = await _mediator.Send(new GetExpiredBatchesReportQuery(warehouseId), cancellationToken);
        return await ExportAsync(data, "Expired", "expired-report", format, cancellationToken);
    }

    private async Task<IActionResult> ExportAsync<T>(
        IReadOnlyList<T> data, string sheetTitle, string fileBaseName, string format, CancellationToken cancellationToken)
    {
        if (string.Equals(format, "pdf", StringComparison.OrdinalIgnoreCase))
        {
            var pdfBytes = await _reportService.GenerateTablePdfAsync(data, sheetTitle, cancellationToken);
            return File(pdfBytes, "application/pdf", $"{fileBaseName}.pdf");
        }

        var excelBytes = await _reportService.GenerateExcelAsync(data, sheetTitle, cancellationToken);
        return File(excelBytes, ExcelContentType, $"{fileBaseName}.xlsx");
    }
}
