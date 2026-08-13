using System.Globalization;
using System.Reflection;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Infrastructure.Services;

public sealed class ReportService : IReportService
{
    public Task<byte[]> GenerateExcelAsync<T>(IReadOnlyList<T> data, string sheetName, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(string.IsNullOrWhiteSpace(sheetName) ? "Sheet1" : sheetName);

        for (var col = 0; col < properties.Length; col++)
        {
            worksheet.Cell(1, col + 1).Value = properties[col].Name;
            worksheet.Cell(1, col + 1).Style.Font.Bold = true;
        }

        for (var row = 0; row < data.Count; row++)
        {
            for (var col = 0; col < properties.Length; col++)
            {
                var value = properties[col].GetValue(data[row]);
                worksheet.Cell(row + 2, col + 1).Value = FormatCellValue(value);
            }
        }

        worksheet.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }

    public Task<byte[]> GeneratePdfAsync(string htmlContent, CancellationToken cancellationToken = default)
    {
        // Рендер произвольного HTML в PDF требует отдельного движка (headless-браузер
        // или аналог) — вне рамок текущей задачи. Для реальных PDF-отчётов используйте
        // GenerateTablePdfAsync, который строит PDF напрямую из данных через QuestPDF.
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes($"<!-- PDF Placeholder -->\n{htmlContent}"));
    }

    public Task<byte[]> GenerateTablePdfAsync<T>(IReadOnlyList<T> data, string title, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        QuestPDF.Settings.License = LicenseType.Community;

        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Text(title).SemiBold().FontSize(16);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        foreach (var _ in properties)
                        {
                            columns.RelativeColumn();
                        }
                    });

                    table.Header(header =>
                    {
                        foreach (var prop in properties)
                        {
                            header.Cell().Border(1).Padding(4).Text(prop.Name).Bold();
                        }
                    });

                    foreach (var item in data)
                    {
                        foreach (var prop in properties)
                        {
                            var value = FormatCellValue(prop.GetValue(item));
                            table.Cell().Border(1).Padding(4).Text(value);
                        }
                    }
                });

                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Сформировано: ");
                    text.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm 'UTC'"));
                });
            });
        });

        return Task.FromResult(document.GeneratePdf());
    }

    private static string FormatCellValue(object? value) => value switch
    {
        null => string.Empty,
        DateTime dt => dt.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
        decimal dec => dec.ToString("0.##", CultureInfo.InvariantCulture),
        _ => value.ToString() ?? string.Empty
    };
}
