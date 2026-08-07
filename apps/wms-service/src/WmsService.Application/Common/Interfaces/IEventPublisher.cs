namespace WmsService.Application.Common.Interfaces;

public interface IEventPublisher
{
    Task PublishAsync<TEvent>(TEvent eventMessage, CancellationToken cancellationToken = default) where TEvent : class;
}
