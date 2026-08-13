using Hangfire;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WmsService.Application.Features.ExpirationChecks.Queries;
using WmsService.Infrastructure.Hangfire.Jobs;

namespace WmsService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ExpirationChecksController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public ExpirationChecksController(IMediator mediator, IBackgroundJobClient backgroundJobClient)
    {
        _mediator = mediator;
        _backgroundJobClient = backgroundJobClient;
    }

    [HttpGet("logs")]
    [ProducesResponseType(typeof(ExpirationCheckLogsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ExpirationCheckLogsResponse>> GetLogs(
        [FromQuery] GetExpirationCheckLogsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpPost("run-check")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public IActionResult RunCheck()
    {
        var jobId = _backgroundJobClient.Enqueue<IExpirationCheckJob>(
            job => job.CheckExpirationsAsync(default));

        return Accepted(new { JobId = jobId, Message = "Expiration check enqueued successfully" });
    }
}
