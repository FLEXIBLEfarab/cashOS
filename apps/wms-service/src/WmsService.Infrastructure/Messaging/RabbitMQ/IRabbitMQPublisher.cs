namespace WmsService.Infrastructure.Messaging.RabbitMQ;

public interface IRabbitMQPublisher
{
    Task PublishAsync<TEvent>(TEvent eventMessage, CancellationToken cancellationToken = default) where TEvent : class;
}
