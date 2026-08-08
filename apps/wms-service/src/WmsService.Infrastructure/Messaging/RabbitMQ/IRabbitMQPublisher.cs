namespace WmsService.Infrastructure.Messaging.RabbitMQ;

public interface IRabbitMQPublisher
{
    Task PublishAsync<TEvent>(string routingKey, TEvent eventMessage, CancellationToken cancellationToken = default) where TEvent : class;
}
