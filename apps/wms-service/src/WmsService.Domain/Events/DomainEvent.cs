namespace WmsService.Domain.Events;

public abstract class DomainEvent
{
    public Guid EventId { get; protected set; }
    public DateTime OccurredOn { get; protected set; }

    protected DomainEvent()
    {
        EventId = Guid.NewGuid();
        OccurredOn = DateTime.UtcNow;
    }
}
