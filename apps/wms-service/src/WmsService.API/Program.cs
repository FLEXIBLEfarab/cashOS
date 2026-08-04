using Serilog;

// ─── Logger (bootstrap) ───────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("🚀 Запуск WMS Service...");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog ─────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console());

    // ─── Services ─────────────────────────────────────────────────────────────
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new()
        {
            Title       = "Четка WMS Service API",
            Version     = "v1",
            Description = "WMS (Warehouse Management System) микросервис для SaaS-системы «Четка».\n" +
                          "Архитектура: Clean Architecture / CQRS (MediatR).",
            Contact = new()
            {
                Name  = "Команда Четка",
                Email = "dev@chetka.kz",
                Url   = new Uri("https://chetka.kz"),
            },
        });

        options.AddSecurityDefinition("Bearer", new()
        {
            Type        = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme      = "bearer",
            BearerFormat = "JWT",
            In          = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Введите JWT токен (получить через /v1/auth/login в Backend API)",
        });

        options.AddSecurityRequirement(new()
        {
            {
                new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
                Array.Empty<string>()
            }
        });
    });

    // ─── CORS ─────────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
    });

    // ─── Health Checks ────────────────────────────────────────────────────────
    builder.Services.AddHealthChecks();

    // TODO (Шаг 4): Зарегистрировать Application и Infrastructure слои
    // builder.Services.AddApplication();
    // builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    // ─── Middleware ───────────────────────────────────────────────────────────
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

    Log.Information("📚 WMS Swagger UI: http://localhost:5000/api/docs");

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
