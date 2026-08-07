using Microsoft.Extensions.Logging;
using WmsService.Application.Common.Interfaces;
using WmsService.Infrastructure.Persistence.Repositories;

namespace WmsService.Infrastructure.Hangfire.Jobs;

public interface IExpirationCheckJob
{
    Task CheckExpirationsAsync(CancellationToken cancellationToken = default);
}

public sealed class ExpirationCheckJob : IExpirationCheckJob
{
    private readonly IBatchRepository _batchRepository;
    private readonly ILogger<ExpirationCheckJob> _logger;

    public ExpirationCheckJob(IBatchRepository batchRepository, ILogger<ExpirationCheckJob> logger)
    {
        _batchRepository = batchRepository;
        _logger = logger;
    }

    public async Task CheckExpirationsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting daily expiration check");

        // Implementation will be completed in Stage 5
        await Task.CompletedTask;

        _logger.LogInformation("Daily expiration check completed");
    }
}
