namespace WmsService.Application.Common.Interfaces;

public interface IReportService
{
    Task<byte[]> GenerateExcelAsync<T>(IReadOnlyList<T> data, string sheetName, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfAsync(string htmlContent, CancellationToken cancellationToken = default);
}
