using Microsoft.Extensions.Logging;
using WmsService.Application.Common.Interfaces;
using WmsService.Infrastructure.Messaging.Events;

namespace WmsService.Infrastructure.Messaging.RabbitMQ;

public sealed class EventPublisher : IEventPublisher
{
    private readonly IRabbitMQPublisher _rabbitMQPublisher;
    private readonly ILogger<EventPublisher> _logger;

    public EventPublisher(IRabbitMQPublisher rabbitMQPublisher, ILogger<EventPublisher> logger)
    {
        _rabbitMQPublisher = rabbitMQPublisher;
        _logger = logger;
    }

    public async Task PublishAsync<TEvent>(TEvent eventMessage, CancellationToken cancellationToken = default) where TEvent : class
    {
        var routingKey = $"wms.{typeof(TEvent).Name}";
        await _rabbitMQPublisher.PublishAsync(routingKey, eventMessage, cancellationToken);
        _logger.LogInformation("Published event {EventType}", typeof(TEvent).Name);
    }
}
