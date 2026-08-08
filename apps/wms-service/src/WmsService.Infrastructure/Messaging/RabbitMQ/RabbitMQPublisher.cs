using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Infrastructure.Messaging.RabbitMQ;

public sealed class RabbitMQPublisher : IRabbitMQPublisher, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMQPublisher> _logger;
    private readonly RabbitMQOptions _options;

    public RabbitMQPublisher(IOptions<RabbitMQOptions> options, ILogger<RabbitMQPublisher> logger)
    {
        _options = options.Value;
        _logger = logger;

        var factory = new ConnectionFactory
        {
            HostName = _options.HostName,
            Port = _options.Port,
            UserName = _options.UserName,
            Password = _options.Password,
            VirtualHost = _options.VirtualHost,
            AutomaticRecoveryEnabled = true
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();
        _channel.ExchangeDeclare(_options.ExchangeName, ExchangeType.Topic, durable: true);
    }

    public Task PublishAsync<T>(string routingKey, T message, CancellationToken cancellationToken = default) where T : class
    {
        var body = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(body);

        var properties = _channel.CreateBasicProperties();
        properties.ContentType = "application/json";
        properties.DeliveryMode = 2;

        _channel.BasicPublish(
            exchange: _options.ExchangeName,
            routingKey: routingKey,
            basicProperties: properties,
            body: bytes);

        _logger.LogInformation("[RabbitMQ] Published to {RoutingKey}: {Message}", routingKey, body);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
    }
}
