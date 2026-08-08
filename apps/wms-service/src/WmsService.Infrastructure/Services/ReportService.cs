using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Infrastructure.Services;

public sealed class ReportService : IReportService
{
    public async Task<byte[]> GenerateExcelAsync<T>(IReadOnlyList<T> data, string sheetName, CancellationToken cancellationToken = default)
    {
        await using var ms = new MemoryStream();
        await using var writer = new StreamWriter(ms, System.Text.Encoding.UTF8);
        using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture));
        await csv.WriteRecordsAsync(data, cancellationToken);
        await writer.FlushAsync(cancellationToken);
        return ms.ToArray();
    }

    public async Task<byte[]> GeneratePdfAsync(string htmlContent, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
        return System.Text.Encoding.UTF8.GetBytes($"<!-- PDF Placeholder -->\n{htmlContent}");
    }
}
