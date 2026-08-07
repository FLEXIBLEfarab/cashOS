namespace WmsService.Application.Common.Exceptions;

public class WmsException : Exception
{
    public WmsException(string message) : base(message) { }
    public WmsException(string message, Exception innerException) : base(message, innerException) { }
}
