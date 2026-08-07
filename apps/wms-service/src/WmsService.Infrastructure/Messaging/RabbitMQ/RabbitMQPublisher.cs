using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace WmsService.Infrastructure.Messaging.RabbitMQ;

public sealed class RabbitMQPublisher : IRabbitMQPublisher, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMQPublisher> _logger;
    private readonly RabbitMQSettings _settings;
    private bool _disposed;

    public RabbitMQPublisher(IOptions<RabbitMQSettings> options, ILogger<RabbitMQPublisher> logger)
    {
        _settings = options.Value;
        _logger = logger;

        var factory = new ConnectionFactory
        {
            HostName = _settings.HostName,
            UserName = _settings.UserName,
            Password = _settings.Password,
            VirtualHost = _settings.VirtualHost,
            Port = _settings.Port
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();
    }

    public Task PublishAsync<TEvent>(TEvent eventMessage, CancellationToken cancellationToken = default) where TEvent : class
    {
        if (_disposed)
            throw new ObjectDisposedException(nameof(RabbitMQPublisher));

        var eventName = typeof(TEvent).Name;
        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(eventMessage));

        _channel.BasicPublish(
            exchange: "chetka.events",
            routingKey: GetRoutingKey(eventName),
            basicProperties: null,
            body: body);

        _logger.LogInformation("Published event {EventName} with routing key {RoutingKey}", eventName, GetRoutingKey(eventName));
        return Task.CompletedTask;
    }

    private static string GetRoutingKey(string eventName) => eventName switch
    {
        "StockReceivedIntegrationEvent" => "stock.updated",
        "StockWrittenOffIntegrationEvent" => "stock.updated",
        "InventoryFinishedIntegrationEvent" => "inventory.finished",
        "ExpirationDetectedIntegrationEvent" => "stock.expiration_warning",
        _ => eventName.ToLowerInvariant()
    };

    public void Dispose()
    {
        if (!_disposed)
        {
            _channel?.Close();
            _connection?.Close();
            _channel?.Dispose();
            _connection?.Dispose();
            _disposed = true;
        }
    }
}
