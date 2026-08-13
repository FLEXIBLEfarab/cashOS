using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WmsService.Application.Common.Interfaces;
using WmsService.Infrastructure.Hangfire.Jobs;
using WmsService.Infrastructure.Messaging.RabbitMQ;
using WmsService.Infrastructure.Persistence;
using WmsService.Infrastructure.Persistence.Repositories;
using WmsService.Infrastructure.Services;
using WmsService.Infrastructure.SignalR.Hubs;

namespace WmsService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<WmsDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(WmsDbContext).Assembly.FullName)));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IBatchRepository, BatchRepository>();
        services.AddScoped<IStockRepository, StockRepository>();
        services.AddScoped<IMovementRepository, MovementRepository>();
        services.AddScoped<IExpirationCheckLogRepository, ExpirationCheckLogRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IWmsNotificationService, WmsNotificationService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options =>
                options.UseNpgsqlConnection(configuration.GetConnectionString("DefaultConnection"))));

        services.AddHangfireServer();
        services.AddScoped<IExpirationCheckJob, ExpirationCheckJob>();

        services.AddSignalR();

        services.Configure<RabbitMQOptions>(configuration.GetSection("RabbitMQ"));
        services.AddSingleton<IRabbitMQPublisher, RabbitMQPublisher>();
        services.AddSingleton<IEventPublisher, EventPublisher>();

        return services;
    }
}
