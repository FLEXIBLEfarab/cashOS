using Microsoft.AspNetCore.Mvc;

namespace WmsService.API.Controllers;

/// <summary>
/// Проверка состояния WMS-сервиса.
/// </summary>
[ApiController]
[Route("v1/[controller]")]
[Produces("application/json")]
public sealed class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Возвращает текущий статус WMS-сервиса.
    /// </summary>
    /// <returns>Объект с информацией о состоянии сервиса.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponseDto), StatusCodes.Status200OK)]
    public IActionResult Get(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Health check requested at {Time:O}", DateTime.UtcNow);

        var response = new HealthResponseDto
        {
            Status = "healthy",
            Service = "WmsService",
            Version = "1.0.0",
            Timestamp = DateTime.UtcNow,
            Uptime = Environment.TickCount64,
        };

        return Ok(response);
    }
}

/// <summary>
/// Ответ на health check запрос.
/// </summary>
public sealed record HealthResponseDto
{
    /// <summary>Статус сервиса: healthy / degraded / unhealthy</summary>
    public required string Status { get; init; }

    /// <summary>Наименование сервиса</summary>
    public required string Service { get; init; }

    /// <summary>Версия сервиса</summary>
    public required string Version { get; init; }

    /// <summary>Время проверки (UTC)</summary>
    public required DateTime Timestamp { get; init; }

    /// <summary>Время работы сервиса в миллисекундах</summary>
    public required long Uptime { get; init; }
}
