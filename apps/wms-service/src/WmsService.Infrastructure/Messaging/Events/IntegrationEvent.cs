namespace WmsService.Infrastructure.Messaging.Events;

public abstract class IntegrationEvent
{
    public Guid EventId { get; protected set; }
    public DateTime Timestamp { get; protected set; }

    protected IntegrationEvent()
    {
        EventId = Guid.NewGuid();
        Timestamp = DateTime.UtcNow;
    }
}
