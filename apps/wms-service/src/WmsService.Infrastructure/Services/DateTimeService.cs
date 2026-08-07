using WmsService.Application.Common.Interfaces;

namespace WmsService.Infrastructure.Services;

public sealed class DateTimeService : IDateTimeService
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
