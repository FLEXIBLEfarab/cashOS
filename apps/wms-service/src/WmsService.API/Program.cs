using Hangfire;
using WmsService.API.Middleware;
using WmsService.Application;
using WmsService.Infrastructure;
using WmsService.Infrastructure.SignalR.Hubs;
using WmsService.Infrastructure.Hangfire.Jobs;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("🚀 Запуск WMS Service...");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console());

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new()
        {
            Title = "Четка WMS Service API",
            Version = "v1",
            Description = "WMS (Warehouse Management System) микросервис для SaaS-системы «Четка».\n" +
                "Архитектура: Clean Architecture / CQRS (MediatR) / Hangfire / SignalR / RabbitMQ.",
            Contact = new()
            {
                Name = "Команда Четка",
                Email = "dev@chetka.kz",
                Url = new Uri("https://chetka.kz"),
            },
        });

        options.AddSecurityDefinition("Bearer", new()
        {
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Введите JWT токен",
        });

        options.AddSecurityRequirement(new()
        {
            {
                new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
                Array.Empty<string>()
            }
        });
    });

    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
    });

    builder.Services.AddHealthChecks();

    var app = builder.Build();

    app.UseExceptionHandling();
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "WMS Service v1");
            options.RoutePrefix = "api/docs";
        });
    }

    app.UseCors();
    app.UseHttpsRedirection();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");
    app.MapHub<WmsHub>("/hubs/wms");

    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new HangfireDashboardAuthFilter() }
    });

    RecurringJob.AddOrUpdate<IExpirationCheckJob>(
        recurringJobId: "daily-expiration-check",
        methodCall: job => job.CheckExpirationsAsync(default),
        cronExpression: Cron.Daily(hour: 2, minute: 0),
        options: new RecurringJobOptions
        {
            TimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Almaty")
        });

    Log.Information("📚 WMS Swagger UI: http://localhost:5000/api/docs");
    Log.Information("📡 WMS SignalR Hub: /hubs/wms");
    Log.Information("🔥 Hangfire Dashboard: /hangfire");

    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "❌ Запуск WMS Service завершился с ошибкой");
}
finally
{
    await Log.CloseAndFlushAsync();
}
