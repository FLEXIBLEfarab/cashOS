using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;
using WmsService.Infrastructure.Messaging.RabbitMQ;
using WmsService.Infrastructure.Persistence.Repositories;

namespace WmsService.Infrastructure.Hangfire.Jobs;

public interface IExpirationCheckJob
{
    Task CheckExpirationsAsync(CancellationToken cancellationToken = default);
}

public sealed class ExpirationCheckJob : IExpirationCheckJob
{
    private readonly IBatchRepository _batchRepository;
    private readonly IRepository<ExpirationCheckLog> _logRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWmsNotificationService _notificationService;
    private readonly IRabbitMQPublisher _rabbitPublisher;
    private readonly ILogger<ExpirationCheckJob> _logger;
    private readonly int _expiringSoonDays;

    public ExpirationCheckJob(
        IBatchRepository batchRepository,
        IRepository<ExpirationCheckLog> logRepository,
        IUnitOfWork unitOfWork,
        IWmsNotificationService notificationService,
        IRabbitMQPublisher rabbitPublisher,
        ILogger<ExpirationCheckJob> logger,
        IConfiguration configuration)
    {
        _batchRepository = batchRepository;
        _logRepository = logRepository;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _rabbitPublisher = rabbitPublisher;
        _logger = logger;
        _expiringSoonDays = configuration.GetValue<int?>("WmsSettings:ExpirationCheck:ExpiringSoonDays") ?? 7;
    }

    public async Task CheckExpirationsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        _logger.LogInformation(
            "[Hangfire] Starting expiration check. Today={Today}, ExpiringSoonDays={Days}",
            today,
            _expiringSoonDays);

        var expiredBatches = await _batchRepository.GetAllExpiredAsync(cancellationToken);
        _logger.LogInformation("[Hangfire] Found {Count} expired batches", expiredBatches.Count);

        int blockedCount = 0;
        foreach (var batch in expiredBatches)
        {
            if (!batch.IsBlocked)
            {
                batch.Block("Auto-blocked: product expired");
                blockedCount++;
            }

            var daysUntil = batch.ExpirationDate.HasValue
                ? (batch.ExpirationDate.Value.Date - today).Days
                : (int?)null;

            var log = new ExpirationCheckLog(
                batchId: batch.Id,
                productId: batch.ProductId,
                warehouseId: batch.WarehouseId,
                checkDate: today,
                daysUntilExpiration: daysUntil,
                isExpired: true,
                isExpiringSoon: false,
                actionTaken: batch.IsBlocked ? "Blocked" : "Already blocked");

            await _logRepository.AddAsync(log, cancellationToken);

            await _notificationService.NotifyNewExpiredProductAsync(
                batch.ProductId,
                batch.Product.Name,
                batch.WarehouseId,
                batch.Warehouse.Name,
                batch.BatchNumber,
                cancellationToken);

            await _rabbitPublisher.PublishAsync("wms.expiration.detected", new
            {
                BatchId = batch.Id,
                ProductId = batch.ProductId,
                WarehouseId = batch.WarehouseId,
                IsExpired = true,
                DaysUntil = daysUntil,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        var expiringBatches = await _batchRepository.GetAllExpiringSoonAsync(_expiringSoonDays, cancellationToken);
        _logger.LogInformation("[Hangfire] Found {Count} expiring-soon batches", expiringBatches.Count);

        foreach (var batch in expiringBatches)
        {
            if (batch.ExpirationDate < today)
                continue;

            var daysUntil = batch.ExpirationDate.HasValue
                ? (batch.ExpirationDate.Value.Date - today).Days
                : (int?)null;

            var log = new ExpirationCheckLog(
                batchId: batch.Id,
                productId: batch.ProductId,
                warehouseId: batch.WarehouseId,
                checkDate: today,
                daysUntilExpiration: daysUntil,
                isExpired: false,
                isExpiringSoon: true,
                actionTaken: "Notification");

            await _logRepository.AddAsync(log, cancellationToken);

            if (daysUntil.HasValue)
            {
                await _notificationService.NotifyExpiringSoonAsync(
                    batch.ProductId,
                    batch.Product.Name,
                    batch.WarehouseId,
                    batch.Warehouse.Name,
                    batch.BatchNumber,
                    daysUntil.Value,
                    cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "[Hangfire] Expiration check completed. Blocked={Blocked}, Logs={Logs}",
            blockedCount,
            expiredBatches.Count + expiringBatches.Count);
    }
}
