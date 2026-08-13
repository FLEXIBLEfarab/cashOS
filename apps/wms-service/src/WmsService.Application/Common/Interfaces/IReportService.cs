namespace WmsService.Application.Common.Interfaces;

public interface IReportService
{
    Task<byte[]> GenerateExcelAsync<T>(IReadOnlyList<T> data, string sheetName, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfAsync(string htmlContent, CancellationToken cancellationToken = default);

    /// <summary>
    /// Настоящая табличная PDF-генерация (QuestPDF) из тех же структурированных
    /// данных, что использует GenerateExcelAsync — в отличие от GeneratePdfAsync
    /// это не заглушка. Для рендера произвольного HTML в PDF нужен отдельный
    /// движок (например, headless-браузер) — за рамками текущей задачи.
    /// </summary>
    Task<byte[]> GenerateTablePdfAsync<T>(IReadOnlyList<T> data, string title, CancellationToken cancellationToken = default);
}
