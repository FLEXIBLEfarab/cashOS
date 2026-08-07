namespace WmsService.Application.Common.Exceptions;

public sealed class NotFoundException : WmsException
{
    public NotFoundException(string entityName, object key)
        : base($"Entity '{entityName}' with key '{key}' was not found.") { }
}
